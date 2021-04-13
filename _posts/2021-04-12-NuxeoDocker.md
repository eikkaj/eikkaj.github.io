---
layout: post
title: Using Docker in a Dev Environment with Nuxeo
---

Hey all, this will be the first post of a series of posts related to working with Nuxeo as a developer while utilizing Docker. 

As a long time Nuxeo developer, I've run Nuxeo across a lot of different mediums, including an attempt on an old RPI once, but that's for another blog post at a future date. Admittedly, for the vast majority of my tenure at Nuxeo, I haven't worked all that much with our Docker images. Most recently, I've begun to change this and have decided to create a series of blog posts related to my experience getting a dev environment up and running with Docker. Utilizing docker can simplify a dev environment quite significantly, as is turns out, and has potential to be a lot more stable. Nuxeo as a company has been working towards providing a more seamless way to get devs up and running from the start, and in order to accomplish this, there's been a lot of investment in building Docker images and dev containers. I'm really excited to finally be taking the time to learn more about Docker and I hope my experiences here may help folks get their environments up and running more easily. 

Since I started writing this first blog post, I've learned a lot of things that will be shaping the following posts in this series. To start, Nuxeo has recently published official documentation for creating a custom Docker image to run with Nuxeo LTS 2021. Please see the documentation here: [Build a custom Docker Image](https://doc.nuxeo.com/nxdoc/build-a-custom-docker-image/#installing-nuxeo-packages). 

In addition to that, I've also learned that there have been folks working feverishly to produce a Containerized Development Environment for folks to use. I think the potential here is absolutely huge and will really enable new developers to get into the juice of building on top of Nuxeo extremely fast. Keep following my blog to learn of this recent development as soon as I know more. 

For folks less familiar with Docker or with Nuxeo & Docker, here is some pre-blog post reading for you.

[Check out this University Course for how to get started with the Nuxeo Platform](https://university.nuxeo.com/learn/course/143/play/395/nuxeo-platform-quickstart-installation-concepts)

[Check out this documentation for how to install Nuxeo with Docker](https://doc.nuxeo.com/nxdoc/docker-image/)

[Check out our Docker Usage Best Practices as part of the Nuxeo Core Developer Guide](https://doc.nuxeo.com/corg/docker-usage/)

[Check out Nuxeo's nuxeo-tools-docker repo which contains some misc Docker files that are used internally - this is a working repo and not officially supported](https://github.com/nuxeo/nuxeo-tools-docker)

[Check  out the docker-library Nuxeo doc](https://github.com/docker-library/docs/tree/master/nuxeo)

[Check out the git repo which contains Nuxeo's official Docker images](https://github.com/nuxeo/docker-nuxeo)
[Docker docs](https://docs.docker.com/)


In the following example, I'm going to be working with my custom marketplace package for customer `XYZ`. I want to provide `XYZ` with a marketplace package that will be usable on Nuxeo LTS 2019. This means that my marketplace package should be built to be compatible with LTS 2019 and my dev environment, which will be utilizing Docker, should be deploying LTS 2019. To deploy my custom marketplace package on a dev server running in docker, I need to create a custom Dockerfile which will first pull down the Nuxeo LTS 2019 image and then deploy my custom MP, and presumably any other packages my server may require (like Nuxeo Drive, Nuxeo Web UI, etc). 

I have a couple local repos set up, one is my custom MP and the next is where my Dockerfile will be. 

![Here is my XYZ DAM marketplace package root directory](/images/0412/xyzDAMapproot.png)
![Here is my XYZ DAM marketplace package, which can be installed on any Nuxeo LTS 2019 server](/images/0412/xyzDAMappMP.png)
![Here is my XYZ Docker root directory, I've already created a Dockerfile which is currently empty](/images/0412/xyzDockerRoot.png)

Let's start with the new Dockerfile. I'm going to add this as the first line:
`FROM nuxeo:10.10`

With just this in place, I can now run a build that will create a Nuxeo app using Nuxeo 10.10 (LTS 2019), in this case I'll build with:
`docker build -t xyzdamapplication .`

![Here is me running the build with just the start of the Dockerfile](/images/0412/DockerFirstBuild.png)

Improving upon this very basic build, we could make the Nuxeo base image configurable by updating my Dockerfile to:
`ARG NUXEO_VERSION
FROM nuxeo:${NUXEO_VERSION}`

and now when I build, I can specify what version of Nuxeo to use:
`docker build -t xyzDAMapplication --build-arg NUXEO_VERSION=10.10`

![Here is me running the build with the new version argument](/images/0412/DockerSecond	Build.png)

Now that I can build an LTS 2019 app with Docker for my dev environment, I want to deploy the server with my custom marketplace package, so I can, of course, continue local development and so on. When using a tomcat server, I would normally just stop the server and manually install the marketplace package using the nuxeoctl script inside of the the Tomcat server `bin` directory. 
`nuxeoctl mp-install xyzMPlocal.zip` or
`nuxeoctl mp-install xyzMPonNuxeoConnect:version`

As of LTS 2021, Nuxeo provides a nice install script that we can use to install packages. The script takes parameters such as the CLID and URL when we want to install remove packages from the marketplace. See here:

https://github.com/nuxeo/nuxeo/tree/master/docker
and 
https://github.com/nuxeo/nuxeo/blob/master/docker/install-packages.sh

Let's download this script to make our lives easier. I'vedownload it myself and copied it to the root directory where my new Dockerfile lives. So now, I can update my Dockerfile to do a few more things. First, I need to make sure Docker will be able to use the install script I just downloaded and copied.

```
USER root
COPY install-packages.sh /
RUN chmod g+rwx,o+rx /install-packages.sh
```

Next I'm going to create a `packages` directory in the root directory of my Dockerfile. Then, I will copy my local mp here so that Docker can access it and install it. Then we can use the script to install the local package. The copying and installation can be set programatically in the Dockerfile:
```
COPY --chown=900:0 /packages/nuxeo-jsf-ui-10.10.zip
$NUXEO_HOME/local-packages/nuxeo-jsf-ui-10.10.zip
```

```
RUN /install-packages.sh --offline $NUXEO_HOME/local-packages/nuxeo-jsf-ui-10.10.zip
User 900
```

You’ll notice I change the current user to 900 after taking care of the installation business. 900 is the recommended user per Nuxeo best practices with Docker.

In the case of installing a remote package from the marketplace, things are even simpler.
`RUN /install-packages.sh --clid ${CLID} --connect-url ${CONNECT_URL} nuxeo-web-ui nuxeo-drive`

Note that in order to pass the CLID and CONNECT_URL, we should update the top of the Dockerfile to expect these arguments.
```
ARG CLID
ARG CONNECT_URL
```

Here’s my full Dockerfile so far:
```
ARG NUXEO_VERSION
FROM nuxeo:${NUXEO_VERSION}
ARG CLID
ARG CONNECT_URL
USER root
COPY install-packages.sh /
RUN chmod g+rwx,o+rx /install-packages.sh
# Install local package of Nuxeo JSF UI
COPY --chown=900:0 /packages/nuxeo-jsf-ui-10.10.zip $NUXEO_HOME/local-packages/nuxeo-jsf-ui-10.10.zip
RUN /install-packages.sh --offline $NUXEO_HOME/local-packages/nuxeo-jsf-ui-10.10.zip
# Install remote package of Nuxeo WebUI and Nuxeo Drive
RUN /install-packages.sh --clid ${CLID} --connect-url ${CONNECT_URL} nuxeo-web-ui nuxeo-drive
# Cleanup
#RUN rm -rf $NUXEO_HOME/local-packages
User 900
We can simplify our run commands by combining local and remote package installation. For example:
RUN /install-packages.sh --clid ${CLID} --connect-url ${CONNECT_URL} nuxeo-web-ui nuxeo-drive $NUXEO_HOME/local-packages/nuxeo-jsf-ui-10.10.zip
```

What about adding custom configuration to the nuxeo.conf file? We already know that in the Docker image, the nuxeo.conf file is located in /etc/nuxeo. NUXEO_CONF is set to /etc/nuxeo/nuxeo.conf .  We can add additional configuration by mounting new property files as volumes into the /etc/nuxeo/conf.d directory and each file will then be appended to the nuxeo.conf . This means we can add to our Dockerfile something like this:
`COPY /path/to/my-configuration.properties /etc/nuxeo/conf.d/my-configuration.properties`

It’s really common for folks to use FFmpeg for lots of things in Nuxeo. It isn’t included in the Docker Nuxeo image but we can easily install the RPM Fusion version in our custom image. We have to run the install as root, just remember to set the user back to 900 after.

```
USER root
RUN yum -y localinstall --nogpgcheck https://mirrors.rpmfusion.org/free/el/rpmfusion-free-release-7.noarch.rpm
RUN yum -y install ffmpeg
USER 900
```

Here’s my sample Dockerfile that builds a custom image based on Nuxeo 10.10! Enjoy

```
ARG NUXEO_VERSION
FROM nuxeo:${NUXEO_VERSION}
ARG CLID
ARG CONNECT_URL
USER root
COPY install-packages.sh /
RUN chmod g+rwx,o+rx /install-packages.sh
# Install local package of Nuxeo JSF UI
COPY --chown=900:0 /packages/nuxeo-jsf-ui-10.10.zip $NUXEO_HOME/local-packages/nuxeo-jsf-ui-10.10.zip
RUN /install-packages.sh --offline $NUXEO_HOME/local-packages/nuxeo-jsf-ui-10.10.zip
# Install remote package of Nuxeo WebUI and Nuxeo Drive
RUN /install-packages.sh --clid ${CLID} --connect-url ${CONNECT_URL} nuxeo-web-ui nuxeo-drive
# Cleanup
#RUN rm -rf $NUXEO_HOME/local-packages
COPY /path/to/my-configuration.properties /etc/nuxeo/conf.d/my-configuration.properties
RUN yum -y localinstall --nogpgcheck https://mirrors.rpmfusion.org/free/el/rpmfusion-free-release-7.noarch.rpm
RUN yum -y install ffmpeg
User 900
```

Coming next:
- docker-compose
- creating a test suite for docker-based dev environments
- containerized development environments