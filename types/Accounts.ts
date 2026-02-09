export type Permission = {
  name: string,
  authorized: boolean,
  authURL: string
}

export type Account = {
  name: string,
  unlinkable: boolean,
  unlinkURL?: string,
  permissions: Permission[]
}