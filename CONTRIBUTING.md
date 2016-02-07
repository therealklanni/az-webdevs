# Contributing

This guide will walk you through all the necessary configurations and guidelines for contributing to this project.

## General

### How to view the task board

To get started, you should first check the task board to see what would be good for you to contribute to. We're using waffle.io to manage the tasks, so head there to look for open tasks.

[**waffle.io task board**](https://waffle.io/therealklanni/az-webdevs)

> You can also just look at the [GitHub issues](https://github.com/therealklanni/az-webdevs/issues) list, but they are not arranged as nicely there.

A few things to note:

- Tasks that we think would be quick or easy are marked with `good for beginners`
- Any task without an assignee is up for grabs, especially ones marked `help wanted`
- Tasks in the Backlog column should be considered lowest priority (likely planned for a future update)
- Task are ordered roughly by importance in each column (most important on top)

### How to submit an issue

**Find a problem with the site? Have an idea for a feature?**

#### Bug reports

The main thing to keep in mind when submitting a bug report is to be as detailed as possible. Include any error messages you encountered or capture a screenshot and include it in your description (please use Markdown image syntax: `![Title](url)`).

For the title/subject of new bug issues, please prefix the title with `[bug]` so it can be more easily identified and reviewed with higher priority.

#### Feature requests / suggestions / questions / et al

For anything that's not a bug, please prefix the title with something relevant such as `[feature]`, etc.

Be as detailed as possible and be open to discussion. Not every feature request will be accepted, and even those that are may not be of high importance.

> Please refrain from leaving :+1: comments on issues; this is not productive.

## Development

### Style guide

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

Currently, this project uses JS Standard Style. Make sure you follow the style and lint your code properly. Pull requests not adhering to the style will not be merged until the style is fixed.

> This may change in the future if project requirements change.

### PR guidelines

All pull requests should follow these simple rules:

- Create a branch for your work; do not submit PRs from your master branch, please
- One feature/bug per branch; if you are working on multiple issues (good for you! :beers:), do so in separate branches
- Make [atomic commits](https://en.wikipedia.org/wiki/Atomic_commit#Atomic_commit_convention); each commit should encompass one "whole" change. An example is any changes (even across multiple files) that relates to fixing whitespace, or changes that refactor a function, etc. If you can't revert your commit without breaking something else, *it's not atomic!*
- Conversely to the above: do not make one large single commit if you are making major revisions to the code (this is only appropriate if you are making one small change, like a bug fix)
- **Submit your PR early!** This is a great way to get early feedback, *especially if you're working on a large change*
- Make sure to manually smoke-test your PR using the Review App (see below)
- Write `Closes #N` (where N is the number of the related issue) at the **bottom** of your PR description, if applicable

### How to set up MongoDB

Mac users can install Mongo with

```
brew install mongodb
```

I use [Robomongo](http://robomongo.org) as my GUI interface, but feel free to use whatever you're most comfortable with.

*Protip: install with `brew cask install robomongo`*

### How to set up your Heroku app (optional)

If you haven't already you'll need to get an account and get the [Heroku Toolbelt](https://toolbelt.heroku.com)(`brew install heroku`) set up before you begin.

You can always view your app locally, however if you would like to test your fork on your own [Heroku](https://heroku.com) instance, [here's how](https://devcenter.heroku.com/articles/getting-started-with-nodejs#deploy-the-app).

> :clipboard: Note: when you create a PR, a temporary Heroku "Review App" will be created automatically (more information below). You can use this app to test your changes for as long as your PR remains open.

### How to set up GitHub App

Whether you're testing **locally** or on Heroku, you **must** set up App keys on GitHub in order to fully test the application.

1. Go to https://github.com/settings/applications/new
1. Enter an *app name* and *homepage URL* (http://localhost is fine)
1. For *Authorization callback URL* you must enter the full local URL **plus** `/auth/github/callback`, e.g. `http://localhost:5000/auth/github/callback` (your hostname/port may differ slightly depending on your local configuration)
1. Submit the form; on the next page, **copy your Client ID and Client Secret** for the next section below

> :warning: Never commit your Client ID/Secret to Git or share them.

### How to create `.env` file

> :warning: Never commit this file to Git! (it should be git-ignored already)

In order to run the local server, first you will need to set some environment variables that the server requires.

Example `.env`:

```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/TXXXXXX/BXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXXX
CLIENT_ID=98324lksdfoiu34lkjf
CLIENT_SECRET=234p9fsp0234klf92ljs9u2oiuio2oui091
GA_TOKEN=UA000000
DEBUG=SIR*,-SIR:auth
```

Required variables, even for local development:

- `CLIENT_ID` - Your GitHub App Client ID, obtained from the previous section
- `CLIENT_SECRET` - Your GitHub App Client Secret, obtained from the previous section
- `SLACK_WEBHOOK_URL` - A fake URL is used for local development
- `GA_TOKEN` - A fake token is used for local development
- `DEBUG` - An important configuration for the development logger; see [debug](https://github.com/visionmedia/debug) for more details on usage

Save these variables (and values) in a file called `.env` in the root of the project (i.e. alongside `app.js`)

### How to run your local server

**`npm start`** — *That's it!* MongoDB will be automatically started/stopped when you start/stop your local server. In the event of a crash, you may need to manually stop MongoDB with the `npm stop` command.

You should see output similar to the following:

```
[nodemon] 1.8.1
[nodemon] to restart at any time, enter `rs`
[nodemon] watching: *.*
[nodemon] starting `nf start`
[OKAY] Loaded ENV .env File as KEY=VALUE Format
```

[Nodemon](https://github.com/nodemon/nodemon) will automatically restart the server every time you make changes.

Debug information is logged to the console periodically based on user interactions in the site.

### How to get your Heroku Review App link

After you create a PR a *Review App* will be created automatically, so your changes can be reviewed in a live Heroku instance. The Review App will automatically deploy any new changes you push to the PR as long as it remains open. Once your PR is closed or merged, the Review App will be automatically destroyed.

Your Review App instance will be named `azwd-staging-pr-N` where `N` is the number of your PR. e.g. `azwd-staging-pr-29` refers to the Review App that corresponded with PR #29.

The URL for your review app will be `https://app-name.herokuapp.com`, e.g. `https://azwd-staging-pr-29.herokuapp.com`. You can use this URL to fully test your changes. It will even post invites to Slack when the application form is submitted (leave a comment on your PR requesting an invite to the "invite tests" channel if you need to test this feature).

> The Review App link will also appear in the PR when it's deployed. You can also join #github in Slack to see all deployment statuses with a link to your Review App when deployed successfully.
