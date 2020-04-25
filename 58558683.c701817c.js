(window.webpackJsonp=window.webpackJsonp||[]).push([[4],{143:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return i})),n.d(t,"metadata",(function(){return c})),n.d(t,"rightToc",(function(){return a})),n.d(t,"default",(function(){return u}));var o=n(1),r=n(9),b=(n(0),n(157)),i={id:"k8s",title:"Kubernetes"},c={id:"k8s",title:"Kubernetes",description:"# Deployment",source:"@site/docs/K8S.md",permalink:"/beacon-bot/docs/k8s",editUrl:"https://github.com/facebook/docusaurus/edit/master/website/docs/K8S.md",sidebar:"someSidebar",previous:{title:"Docker",permalink:"/beacon-bot/docs/docker"},next:{title:"User Guide",permalink:"/beacon-bot/docs/user_guide"}},a=[{value:"Running the bot",id:"running-the-bot",children:[]},{value:"Bring up the bot",id:"bring-up-the-bot",children:[]}],l={rightToc:a};function u(e){var t=e.components,n=Object(r.a)(e,["components"]);return Object(b.b)("wrapper",Object(o.a)({},l,n,{components:t,mdxType:"MDXLayout"}),Object(b.b)("h1",{id:"deployment"},"Deployment"),Object(b.b)("p",null,"In the ",Object(b.b)("a",Object(o.a)({parentName:"p"},{href:"../kubernetes"}),"Kubernetes")," folder are 3 files."),Object(b.b)("pre",null,Object(b.b)("code",Object(o.a)({parentName:"pre"},{}),"- bot-deployment.yml: Pulls from docker.io for beaconbot image \n- db-deployment.yml: Deploys a Mysql database for persistent configuration\n- env-configmap.yml: This is where various env variables are configured for the bot (Eg. Bot-token, Channels. Roles, etc)\n")),Object(b.b)("h2",{id:"running-the-bot"},"Running the bot"),Object(b.b)("p",null,"The configuration is done via the env-configmap.yml file.  Please copy the file and update accordingly."),Object(b.b)("h2",{id:"bring-up-the-bot"},"Bring up the bot"),Object(b.b)("p",null,"The easiest way to bring up the bot is to run Kubectl."),Object(b.b)("p",null,"From inside the kubernetes folder run"),Object(b.b)("pre",null,Object(b.b)("code",Object(o.a)({parentName:"pre"},{}),"kubectl apply -f env-configmap.yml,db-deployment.yml,bot-deployment.yml\n")),Object(b.b)("p",null,"To verify that the bot is up and running (You should see 2 pods running with bot-deployment and db-deployment prefixes.):"),Object(b.b)("pre",null,Object(b.b)("code",Object(o.a)({parentName:"pre"},{}),"kubectl get pods\n")))}u.isMDXComponent=!0}}]);