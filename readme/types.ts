export type TestCase = {
  key: string,
  actual: any,
  expected: any,
  exact?: boolean
  expected_as_string?: string,
}
