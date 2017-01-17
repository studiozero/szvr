# Zero hassle website

You need to install `s3-upload`

```npm install -g s3-upload```

## First things first...

In order to get this working, you'll need an AWS credentials config file. This will not be stored in the repo. Someone else has it.

It's called `aws-credentials.json`, and it contains the magic words to tell AWS to let you deploy your app. The contents will look something like : 

{
  "accessKeyId": "secretIdGoesHere",
  "secretAccessKey": "secretAccessKeyGoesHere",
  "region": "eu-west-2"
}

If you don't have this file, and no-one else has this file... you're going to need to login to AWS and create another one. 

**Got it?**

Cool. 

Now do these steps (you'll only need to do this once)

* `npm install -g s3-upload`
* `npm install`

That should do the trick.


## Making the site

* Go to the root of the project.
* `npm run build`

## Deploying the site

* Go to the root of the project.
* `npm run deploy`

## Deploying a test version

* `npm run deploy-test`


## Creating the site

OK - so we use some core tech here to make our lives easier

* Pug (FKA Jade) for templating
* SASS as CSS pre-processor
* CommonMark.js for writing posts

### Some principles

You'll noticed there's a '_drafts' folder in the blog section. This is because this is (deliberately) a public github repo. _This_ folder doesn't get uploaded to github. Sometimes we don't want to show our working out, before we show the results.

By convention, folders with a '_' prefix will be ignored in the build. This is to help our IDEs maintain relative links without cumbersome configs.

Also, folders with an `index.html` at the root, will be uploaded wholesale, assuming that they're for microsites or standalone demos. **Nothing will be built** 

You can also include a pug template anywhere you like (to render a specific page) by prefixing it with '_' and adding a 'template' attribute to the markdown's YAML data. It's nothing special, just that sometimes you want the template to live with the code, rather than in the templates folder.

Generally speaking, the way to structure a folder is : 

````
/src
    /your-folder
        index.pug                   # renders the index page for this folder
        _local_template.pug         # use for some 'special' page
        article.md                  # data
````

### YAML

We use frontmatter YAML in the markdown files to pass on additional data to the publishing system.