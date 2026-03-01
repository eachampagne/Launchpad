import express from 'express';
import axios from 'axios';

const github = express.Router();

github.get('/changelog', async (req, res) => {
  // this is for the front page, so it doesn't have to be authenticated

  try {
    // tested in Postman
    const queryString = '{ repository(owner:"Operation-Yuzu", name:"Launchpad") { pullRequests(last: 10) { edges { node { number merged mergedAt title} } } } }';

    const changelogData = await axios.post('https://api.github.com/graphql', {
      query: queryString
    }, {
      headers: {
        'Authorization': `bearer ${process.env.GH_AUTH_TOKEN}`
      }
    });

    const pullRequestNodes: {node: {number: number, merged: boolean, mergedAt: string, title: string}}[] = changelogData?.data?.data?.repository?.pullRequests?.edges; // yes there are two datas

    const pullRequests = pullRequestNodes
      .map(pr => pr.node) // reduce some of the nesting
      .filter(pr => pr.merged) // exclude any open or closed without merging PRs
      .sort((a, b) => { // sort in reverse order of merge date (rather than open date). Fortunately the date strings sort nicely
        if (a.mergedAt === b.mergedAt) {
          return 0;
        } else if (a.mergedAt < b.mergedAt) {
          return 1;
        } else {
          return -1;
        }
      })

    return res.status(200).send(pullRequests);
  } catch (error) {
    console.error('Failed to query GitHub for PRs on this repo:', error);
    res.sendStatus(500);
  }
});

export default github;