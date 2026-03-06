The ability to save settings specific to a single widget opens up many possibilities. Currently these settings are only used to set a default calendar for each calendar widget, which, for example, allows creating a dashboard that has multiple calendar widgets open to different calendars (personal, school, holidays, etc).

Future ideas for this:
 * Link widgets that save a given link
 * Searchbar widgets that save the user's search engine preference
 * GitHub widget that shows recent pull requests on a user-specified repository

Different types of widgets may have different available settings, or none at all. To facilitate this polymorphism, each `LayoutElement` may have a corresponding `WidgetSettings` entry, which may have a corresponding `<Widget Type>Settings` entry. (There is no constraint against a single `WidgetSettings` having multiple, differently typed settings (calendar AND link AND ...) but a given widget should only use its own.) Though the `WidgetSettings` intermediary creates an extra level of nesting, it does mean that different settings are 'namespaced' - they won't conflict with identically named settings for a different widget, and one widget type with many settings won't 'get in the way' of other widgets.

All settings are included in the response from the `GET /dashboard/:id` route, and passed, along with the `LayoutElement` id, into each widget component through props. The widget is free to ignore the settings and id, but if it does use them, it must account for the possibility that the settings are `null`.

When adding a new type of settings (may be missing some steps, needs a test run):

 * Create the new settings schema
 * Create the relationship between the new settings schema and WidgetSettings
 * Create the new settings type in `/types/LayoutTypes.ts`, then add it to the WidgetSettings type
 * Include the new settings in the `GET /dashboard/:id` route
    * Should it also be included when duplicating routes? TBD
        * Argument against: if a user is duplicate someone else's route, their dash shouldn't be attempting to access the original user's calendar, for example
        * Argument for: the calendar widget would detect that it was trying to access an inaccessible calendar and clear it. And having preset links for major sites might be convenient...