---
layout: post
title: How to search for documents via their parent containers (part 2)
---

![parent-container](/images/0505/parent-container.png)

I wrote an article a couple of weeks ago about searching for documents via their parent containers and provided some code samples for a custom ElasticSearch Writer that would help facilitate that. As I previously explained, a document holds a relationship with its parent via the OOTB property `ecm:parentId`. If I were to add `ecm:parentId` as a predicate to a page provider and scaffold the search layouts in Designer, Studio would add a standard textfield in the search form that users could utilize to search via the `ecm:parentId`. This generally would not be sufficient because most users are not going to know what the container UID is. This is why indexing the parent names was useful - users could then search via the container names instead! But there is an even simpler way to accomplish all of this, without an ES Writer!

[Check out the Nuxeo Studio Cookbook for searching via parent containers](https://github.com/nuxeo/nuxeo-studio-community-cookbook/tree/master/modules/nuxeo/parent-container-search)

The solution I am proposing requires some Studio configuration and NO java development. All you have to do  is add the `ecm:parentId` as a predicate to your page provider. In your search form layout, instead of using the Nuxeo text widget that is automatically added for you, add a `nuxeo-document-suggestion` widget. See the below code sample:

```
<nuxeo-document-suggestion role="widget" label="Parent ID Suggestion" value="{{params.system_parentId}}" placeholder="" min-chars="0" page-provider="ContainerDocPP"></nuxeo-document-suggestion>
```

You will notice in the sample above that I'm also specifying a custom page provider called `ContainerDocPP`. The Studio Cookbook will show you how it is defined in Modeler. All it's doing is searching for any document that is `Folderish` ie a container! 

Can you think of a better way to implement Searching via Containers in the Nuxeo WebUI?