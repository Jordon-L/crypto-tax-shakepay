(this["webpackJsonpreact-flask-app"]=this["webpackJsonpreact-flask-app"]||[]).push([[0],{61:function(e,t,a){},62:function(e,t,a){},86:function(e,t,a){"use strict";a.r(t);var n=a(0),c=a.n(n),i=a(9),s=a.n(i),l=(a(61),a(44)),o=a(45),r=a(49),j=a(48),d=a(14),b=(a(62),a(46)),u=a.n(b),h=a(128),O=a(137),p=a(138),x=a(141),f=a(140),m=a(136),g=a(143),v=a(139),C=a(135),T=(a(81),a(142)),y=a(133),S=a(134),k=a(131),B=a(5),E=Object(h.a)((function(e){return{root:{width:"100%"},button:{marginRight:e.spacing(1),color:"#F7F7F7",background:"black",textTransform:"capitalize","&:hover":{backgroundColor:"black"}},instructions:{marginTop:e.spacing(1),marginBottom:e.spacing(1)}}}));function F(){var e,t=Object(n.useState)(null),a=Object(d.a)(t,2),c=a[0],i=a[1],s=Object(n.useState)(null),l=Object(d.a)(s,2),o=l[0],r=l[1],j=Object(n.useState)(null),b=Object(d.a)(j,2),h=b[0],F=b[1],A=Object(n.useState)([]),D=Object(d.a)(A,2),H=D[0],w=D[1],P=Object(n.useState)([]),G=Object(d.a)(P,2),I=G[0],L=G[1],R=Object(n.useState)({}),W=Object(d.a)(R,2),N=W[0],J=W[1],M=Object(n.useState)(!1),z=Object(d.a)(M,2),U=z[0],q=z[1],K=Object(n.useState)(!1),Q=Object(d.a)(K,2),V=Q[0],X=Q[1],Y=E(),Z=Object(n.useState)(0),$=Object(d.a)(Z,2),_=$[0],ee=$[1],te=Object(n.useState)(10),ae=Object(d.a)(te,2),ne=ae[0],ce=ae[1];return e=0===H.length&&0===I.length?Object(B.jsx)("div",{class:"content",children:Object(B.jsxs)(k.a,{container:!0,spacing:3,justify:"center",direction:"column",alignItems:"center",style:{minHeight:"100vh"},children:[Object(B.jsxs)(k.a,{item:!0,xs:6,children:["Shakepay csv file:\xa0",Object(B.jsxs)(y.a,{className:Y.button,variant:"contained",component:"label",children:["Choose File",Object(B.jsx)("input",{id:"fileInput",type:"file",onChange:function(e){var t;i(e.target.files[0]),t=e.target.files[0].name,document.getElementById("selectedFile").innerHTML="Selected File: "+t},hidden:!0})]})]}),Object(B.jsx)(k.a,{item:!0,xs:6,children:Object(B.jsx)("div",{id:"selectedFile",children:"Selected File: "})}),Object(B.jsx)(k.a,{item:!0,xs:6,children:Object(B.jsx)(y.a,{className:Y.button,variant:"contained",color:"primary",onClick:function(){return function(e,t,a,n,c,i,s,l,o){if(null==e)o(!0),s(!1);else{o(!1),s(!0);var r=new FormData;r.append("file",e),r.append("wallet",t),r.append("shakepayWallet",a),u.a.post("/upload",r,{}).then((function(e){!function(e,t,a,n){a(t),n(e)}(e.data.table,e.data.columns,n,c),i({incomeGain:e.data.info.incomeGain,capitalLoss:e.data.info.capitalLoss,capitalGain:e.data.info.capitalGain,totalBTC:e.data.info.totalBTC,totalETH:e.data.info.totalETH,totalCAD:e.data.info.totalCAD,CADSent:e.data.info.CADSent,CADReceived:e.data.info.CADReceived,avgBTC:e.data.info.avgBTC,avgETH:e.data.info.avgETH})}))}}(c,h,o,w,L,J,q,0,X)},children:"Upload "})}),Object(B.jsx)(k.a,{item:!0,xs:6,children:Object(B.jsx)("h4",{children:" Optional "})}),Object(B.jsx)(k.a,{Item:!0,xs:6,children:Object(B.jsx)("p",{children:"Non-shakepay ethereum data will not be 100% accurate due to limited historical price data available on Coingecko."})}),Object(B.jsxs)(k.a,{item:!0,xs:6,children:["Shakepay Ethereum Wallet: ",Object(B.jsx)("input",{type:"text",name:"shakepayWallet",onChange:function(e){return r(e.target.value)}})]}),Object(B.jsxs)(k.a,{item:!0,xs:6,children:["non-Shakepay Ethereum Wallet: ",Object(B.jsx)("input",{type:"text",name:"wallet",onChange:function(e){e.target.value;F(e.target.value)}})]}),Object(B.jsxs)(k.a,{item:!0,xs:6,children:[U?Object(B.jsx)(S.a,{}):"",V?"Please upload a csv file from shakepay":""]})]})}):Object(B.jsxs)("div",{class:"content",children:[Object(B.jsx)("div",{id:"table",children:Object(B.jsxs)(C.a,{className:Y.root,children:[Object(B.jsx)(m.a,{className:Y.container,children:Object(B.jsxs)(O.a,{stickyHeader:!0,"aria-label":"transaction table",children:[Object(B.jsx)(p.a,{children:Object(B.jsx)(v.a,{children:H.map((function(e){return Object(B.jsx)(f.a,{children:e.field},e.title)}))})}),Object(B.jsx)(x.a,{children:I.slice(_*ne,_*ne+ne).map((function(e){return Object(B.jsx)(v.a,{children:H.map((function(t){var a=e[t.title];return Object(B.jsx)(f.a,{children:a},t.title)}))})}))})]})}),Object(B.jsx)(g.a,{rowsPerPageOptions:[10,25,100],component:"div",count:I.length,rowsPerPage:ne,page:_,onChangePage:function(e,t){ee(t)},onChangeRowsPerPage:function(e){ce(+e.target.value),ee(0)}})]})}),Object(B.jsxs)("div",{id:"tax",children:[Object(B.jsxs)("p",{children:["Income Gain: ",N.incomeGain]}),Object(B.jsxs)("p",{children:["Capital Gain: ",N.capitalGain]}),Object(B.jsxs)("p",{children:["Capital Loss: ",N.capitalLoss]}),Object(B.jsxs)("p",{children:["BTC currently in possession: ",N.totalBTC,", Average Cost of BTC:  ",N.avgBTC]}),Object(B.jsxs)("p",{children:["ETH currently in possession: ",N.totalETH,", Average Cost of ETH:  ",N.avgETH," "]}),Object(B.jsxs)("p",{children:["CAD sent: ",N.CADSent," "]}),Object(B.jsxs)("p",{children:["CAD Received: ",N.CADReceived," "]})]})]}),Object(B.jsx)(T.a,{maxWidth:"false",children:e})}var A=function(e){Object(r.a)(a,e);var t=Object(j.a)(a);function a(){return Object(l.a)(this,a),t.apply(this,arguments)}return Object(o.a)(a,[{key:"render",value:function(){return Object(B.jsxs)(T.a,{maxWidth:"false",children:[Object(B.jsx)("h1",{children:" Crypto Bro Tax"}),Object(B.jsx)("h3",{children:" Ethereum Tax calculator for Shakepay"}),Object(B.jsx)(F,{})]})}}]),a}(n.Component),D=function(e){e&&e instanceof Function&&a.e(3).then(a.bind(null,145)).then((function(t){var a=t.getCLS,n=t.getFID,c=t.getFCP,i=t.getLCP,s=t.getTTFB;a(e),n(e),c(e),i(e),s(e)}))};s.a.render(Object(B.jsx)(c.a.StrictMode,{children:Object(B.jsx)(A,{})}),document.getElementById("root")),D()}},[[86,1,2]]]);
//# sourceMappingURL=main.c4b1ebe8.chunk.js.map