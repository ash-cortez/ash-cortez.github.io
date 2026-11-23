"""Save the GitHub contribution calendar for the site's commit map.

Usage: GITHUB_TOKEN=... python scripts/fetch_contributions.py [login]
Writes data/contributions.json: {"total": int, "weeks": [[{"date", "count"}, ...], ...]}
"""
import json
import os
import sys
import urllib.request

LOGIN = sys.argv[1] if len(sys.argv) > 1 else "ash-cortez"
QUERY = """query($login: String!) { user(login: $login) { contributionsCollection {
  contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } } } } }"""

token = os.environ["GITHUB_TOKEN"]
req = urllib.request.Request(
    "https://api.github.com/graphql",
    data=json.dumps({"query": QUERY, "variables": {"login": LOGIN}}).encode(),
    headers={"Authorization": f"bearer {token}", "Content-Type": "application/json"},
)
with urllib.request.urlopen(req) as resp:
    body = json.load(resp)
if "errors" in body:
    sys.exit(f"GraphQL error: {body['errors']}")

cal = body["data"]["user"]["contributionsCollection"]["contributionCalendar"]
out = {
    "total": cal["totalContributions"],
    "weeks": [[{"date": d["date"], "count": d["contributionCount"]} for d in w["contributionDays"]] for w in cal["weeks"]],
}
os.makedirs("data", exist_ok=True)
with open("data/contributions.json", "w") as f:
    json.dump(out, f, separators=(",", ":"))
print(f"{out['total']} contributions across {len(out['weeks'])} weeks")
