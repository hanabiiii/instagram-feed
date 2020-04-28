Instagram Feeds for your community. Simple to Setup, customizable and responsive.


## Demo

[Instagram Feed Demo page](https://otdev-developer-edition.ap15.force.com/s/instagram-feed)

## Installation Instructions

There are two ways to install this component:

-   [Using a Scratch Org](#installing-to-your-org): This is the recommended installation option. Use this option if you are a developer who wants to experience the code.
-   [Using an Unmanaged Package](#installing-using-an-unmanaged-package): This option allows anybody to experience the sample app without installing a local development environment.

## Installing to your Org

1. Set up your environment. Follow the steps in the [Quick Start: Lightning Web Components](https://trailhead.salesforce.com/content/learn/projects/quick-start-lightning-web-components/) Trailhead project. The steps include:

-   Install Salesforce CLI
-   Install Visual Studio Code
-   Install the Visual Studio Code Salesforce extensions, including the Lightning Web Components extension

2. If you haven't already done so, authenticate with your org

```
sfdx force:auth:web:login
```

3. Clone the repository:

```
git clone https://github.com/hanabiiii/instagram-feed.git
cd instagram-feed
```

4. Deploy the component to your org:

```
sfdx force:source:deploy -x manifest/package -u [your-account]
```


## Installing using an Unmanaged Package