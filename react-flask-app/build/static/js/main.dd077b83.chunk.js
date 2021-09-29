(this["webpackJsonpreact-flask-app"]=this["webpackJsonpreact-flask-app"]||[]).push([[0],{120:function(e,t,a){},121:function(e,t,a){},152:function(e,t,a){"use strict";a.r(t);var n=a(0),c=a.n(n),i=a(11),l=a.n(i),s=(a(120),a(92)),o=a(93),r=a(100),j=a(99),d=a(16),b=a(63),u=(a(121),a(94)),h=a.n(u),O=a(198),x=a(207),m=a(208),p=a(211),C=a(210),f=a(206),T=a(227),g=a(209),S=a(212),y=(a(141),a(103)),v=a(224),N=a(205),k=a(221),w=a(217),F=a(218),E=a(220),B=a(219),D=a(229),P=a(216),G=a(203),H=a(204),A=a(202),I=a(95),W=a(230),L=a(222),M=a(223),Y=a(97),J=a.n(Y),z=a(98),K=a(15),R=a(225),U=a(5),V=Object(O.a)((function(e){var t;return{root:{width:"100%"},button:{color:"#F7F7F7",background:"black",textTransform:"capitalize","&:hover":{backgroundColor:"black"}},instructions:{marginTop:e.spacing(1),marginBottom:e.spacing(1)},grid:Object(b.a)({},e.breakpoints.down("sm"),{width:"100%"}),inputCard:(t={display:"flex",flexDirection:"column",alignItems:"center"},Object(b.a)(t,e.breakpoints.up("md"),{width:"960px"}),Object(b.a)(t,e.breakpoints.down("sm"),{width:"100%"}),t),inputCardAction:{flexGrow:1,display:"flex",flexDirection:"column"},table:{width:"1500px"},disabledAccordion:{backgroundColor:"#fff !important"},disabledAccordionSummary:{opacity:"1 !important"},moreDetail:{marginLeft:"0.5em"}}}));function q(e){var t=e.openTable,a=e.onCloseTable,c=e.data,i=e.columns,l=V(),s=Object(n.useState)(0),o=Object(d.a)(s,2),r=o[0],j=o[1],b=Object(n.useState)(10),u=Object(d.a)(b,2),h=u[0],O=u[1],y=h-Math.min(h,c.length-r*h);return Object(U.jsxs)(D.a,{onClose:a,maxWidth:"1500px",open:t,children:[Object(U.jsx)(A.a,{id:"simple-dialog-title",children:"Transaction Table"}),Object(U.jsxs)(G.a,{children:[Object(U.jsx)(H.a,{children:"Shakingsats is not displayed, but is calculated as Income"}),Object(U.jsx)(I.CSVLink,{data:c,filename:"transactionTable.csv",children:Object(U.jsx)(N.a,{className:l.button,variant:"contained",component:"label",children:"Download"})}),Object(U.jsx)(f.a,{className:l.table,children:Object(U.jsxs)(x.a,{stickyHeader:!0,"aria-label":"transaction table",children:[Object(U.jsx)(m.a,{children:Object(U.jsx)(g.a,{children:i.map((function(e){return Object(U.jsx)(C.a,{children:e.field},e.title)}))})}),Object(U.jsxs)(p.a,{children:[(h>0?c.slice(r*h,r*h+h):c).map((function(e){return Object(U.jsx)(g.a,{children:i.map((function(t){var a=e[t.field];return Object(U.jsx)(C.a,{children:a},t.title)}))})})),y>0&&Object(U.jsx)(g.a,{style:{height:53*y},children:Object(U.jsx)(C.a,{colSpan:6})})]}),Object(U.jsx)(S.a,{children:Object(U.jsx)(g.a,{children:Object(U.jsx)(T.a,{rowsPerPageOptions:[10,25,{label:"All",value:-1}],count:c.length,rowsPerPage:h,page:r,onChangePage:function(e,t){j(t)},onChangeRowsPerPage:function(e){O(+e.target.value),j(0)}})})})]})})]})]})}function Q(e){var t=V(),a=e.openDisclaimer,n=e.onCloseDisclaimer;return Object(U.jsxs)(D.a,{onClose:n,maxWidth:"1500px",open:a,children:[Object(U.jsx)(A.a,{children:"Disclaimer"}),Object(U.jsx)(G.a,{children:Object(U.jsx)(H.a,{children:"This application is not a replacement for a professional accountant. This application was made with the intention of learning. Please do not use as a solution for your tax purposes. Please use commercial products like Koinly (paid) or Crypto.com Tax (free)"})}),Object(U.jsx)(P.a,{children:Object(U.jsx)(N.a,{className:t.button,onClick:n,variant:"contained",component:"label",children:"Close"})})]})}function X(){var e,t=Object(n.useState)(null),a=Object(d.a)(t,2),i=a[0],l=a[1],s=Object(n.useState)(null),o=Object(d.a)(s,2),r=o[0],j=o[1],b=Object(n.useState)(null),u=Object(d.a)(b,2),O=u[0],x=u[1],m=Object(n.useState)([]),p=Object(d.a)(m,2),C=p[0],f=p[1],T=Object(n.useState)([]),g=Object(d.a)(T,2),S=g[0],D=g[1],P=Object(n.useState)({}),G=Object(d.a)(P,2),H=G[0],A=G[1],I=Object(n.useState)(!1),Y=Object(d.a)(I,2),X=Y[0],Z=Y[1],$=Object(n.useState)(!1),_=Object(d.a)($,2),ee=_[0],te=_[1],ae=Object(n.useState)(!1),ne=Object(d.a)(ae,2),ce=ne[0],ie=ne[1],le=c.a.useState(!1),se=Object(d.a)(le,2),oe=se[0],re=se[1],je=c.a.useState(!1),de=Object(d.a)(je,2),be=de[0],ue=de[1],he=Object(n.useState)(new Date),Oe=Object(d.a)(he,2),xe=Oe[0],me=Oe[1],pe=Object(n.useState)(!0),Ce=Object(d.a)(pe,2),fe=Ce[0],Te=Ce[1],ge=new Date,Se=ge.getFullYear(),ye=ge.getMonth(),ve=ge.getDate(),Ne=new Date(Se-5,ye,ve),ke=ge,we=V();return e=0===C.length&&0===S.length?Object(U.jsxs)("div",{class:"content",children:[Object(U.jsx)(w.a,{container:!0,justify:"center",direction:"column",alignItems:"center",children:Object(U.jsx)(w.a,{item:!0,xs:12,className:we.grid,children:Object(U.jsx)(F.a,{children:Object(U.jsxs)(B.a,{className:we.inputCard,children:[Object(U.jsxs)(E.a,{className:we.inputCardAction,children:["Year:",Object(U.jsx)(K.a,{utils:z.a,children:Object(U.jsx)(R.a,{value:xe,onChange:me,views:["year"],minDate:Ne,maxDate:ke})})]}),Object(U.jsx)(y.a,{children:"Shakepay csv file:"}),Object(U.jsx)(E.a,{className:we.inputCardAction,children:Object(U.jsxs)(N.a,{className:we.button,variant:"contained",component:"label",children:["Choose File",Object(U.jsx)("input",{id:"fileInput",type:"file",onChange:function(e){var t;l(e.target.files[0]),t=e.target.files[0].name,document.getElementById("selectedFile").innerHTML="Selected File: "+t},hidden:!0})]})}),Object(U.jsx)(y.a,{children:Object(U.jsx)("div",{id:"selectedFile",children:"Selected File: "})}),Object(U.jsx)(E.a,{className:we.inputCardAction,children:Object(U.jsx)(N.a,{className:we.button,variant:"contained",color:"primary",onClick:function(){return function(e,t,a,n,c,i,l,s,o,r,j,d){if(null===e||null===r)o(!0),l(!1);else if(null!=t&&null===a||null!=t&&""===a)j(!0),l(!1);else{o(!1),j(!1),d(!1),l(!0);var b=new FormData;b.append("file",e),b.append("wallet",t),b.append("shakepayWallet",a),console.log(r.getFullYear()),b.append("year",r.getFullYear()),h.a.post("/upload",b,{}).then((function(e){if("true"===e.data.error)d(!0),l(!1);else{!function(e,t,a,n){a(t),n(e)}(e.data.table,e.data.columns,n,c);var t=JSON.parse(e.data.info);i({incomeGain:t.incomeGain,capitalGain:t.capitalGain,totalNumberETH:t.totalNumberETH,totalSalePriceETH:t.totalSalePriceETH,totalCostETH:t.totalCostETH,totalFeesETH:t.totalFeesETH,totalGainsETH:t.totalGainsETH,totalNumberBTC:t.totalNumberBTC,totalSalePriceBTC:t.totalSalePriceBTC,totalCostBTC:t.totalCostBTC,totalFeesBTC:t.totalFeesBTC,totalGainsBTC:t.totalGainsBTC})}}))}}(i,O,r,f,D,A,Z,0,te,xe,ue,ie)},children:"Upload "})}),Object(U.jsx)(y.a,{children:Object(U.jsx)("h4",{children:" Optional "})}),"Non-shakepay ethereum data will not be 100% accurate due to limited historical price data available on Coingecko.",Object(U.jsxs)(E.a,{className:we.inputCardAction,children:["Shakepay Ethereum Wallet: ",Object(U.jsx)("input",{type:"text",name:"shakepayWallet",onChange:function(e){return j(e.target.value)}})]}),Object(U.jsxs)(E.a,{className:we.inputCardAction,children:["non-Shakepay Ethereum Wallets (comma separated): ",Object(U.jsx)("input",{type:"text",name:"wallet",onChange:function(e){x(e.target.value)}})]}),Object(U.jsxs)(y.a,{children:[X?Object(U.jsx)(k.a,{}):"",ee?"No csv selected or year is empty":"",ce?"Format incorrect in csv":"",be?"Fill in Shakepay Wallet address":""]})]})})})}),Object(U.jsx)(Q,{openDisclaimer:fe,onCloseDisclaimer:function(){Te(!1)}})]}):Object(U.jsxs)("div",{class:"content",children:[Object(U.jsx)(w.a,{container:!0,justify:"center",direction:"column",alignItems:"center",children:Object(U.jsx)(w.a,{item:!0,xs:12,className:we.grid,children:Object(U.jsx)(F.a,{className:we.inputCard,children:Object(U.jsxs)(B.a,{children:[Object(U.jsxs)("div",{children:[Object(U.jsx)(W.a,{disabled:!0,className:we.disabledAccordion,children:Object(U.jsx)(L.a,{"aria-controls":"panel1a-content",id:"panel1a-header",className:we.disabledAccordionSummary,children:Object(U.jsxs)(y.a,{children:["Income: ",H.incomeGain]})})}),Object(U.jsxs)(W.a,{children:[Object(U.jsx)(L.a,{expandIcon:Object(U.jsx)(J.a,{}),"aria-controls":"panel2a-content",id:"panel2a-header",children:Object(U.jsxs)(y.a,{children:["Capital gain: ",H.capitalGain]})}),Object(U.jsxs)(M.a,{children:[Object(U.jsxs)(y.a,{className:we.moreDetail,children:["BTC",Object(U.jsxs)(y.a,{children:["Total BTC: ",H.totalNumberBTC]}),Object(U.jsxs)(y.a,{children:["Total Sale: ",H.totalSalePriceBTC]}),Object(U.jsxs)(y.a,{children:["Total Cost: ",H.totalCostBTC]}),Object(U.jsxs)(y.a,{children:["Total Fees: ",H.totalFeesBTC]}),Object(U.jsxs)(y.a,{children:["Total Gain: ",H.totalGainsBTC]})]}),Object(U.jsxs)(y.a,{className:we.moreDetail,children:["ETH",Object(U.jsxs)(y.a,{children:["Total ETH: ",H.totalNumberETH]}),Object(U.jsxs)(y.a,{children:["Total Sale: ",H.totalSalePriceETH]}),Object(U.jsxs)(y.a,{children:["Total Cost: ",H.totalCostETH]}),Object(U.jsxs)(y.a,{children:["Total Fees: ",H.totalFeesETH]}),Object(U.jsxs)(y.a,{children:["Total Gain: ",H.totalGainsETH]})]})]})]}),Object(U.jsx)(W.a,{disabled:!0,className:we.disabledAccordion,children:Object(U.jsx)(L.a,{"aria-controls":"panel3a-content",id:"panel3a-header",className:we.disabledAccordionSummary,children:Object(U.jsxs)(y.a,{children:["Taxable Income: ",+H.incomeGain+.5*+H.capitalGain]})})})]}),Object(U.jsx)(E.a,{className:we.inputCardAction,children:Object(U.jsx)(N.a,{className:we.button,variant:"contained",color:"primary",onClick:function(){re(!0)},children:"Display transaction table "})})]})})})}),Object(U.jsx)(q,{openTable:oe,onCloseTable:function(){re(!1)},data:S,columns:C})]}),Object(U.jsx)(v.a,{disableGutters:!0,maxWidth:"false",children:e})}var Z=function(e){Object(r.a)(a,e);var t=Object(j.a)(a);function a(){return Object(s.a)(this,a),t.apply(this,arguments)}return Object(o.a)(a,[{key:"render",value:function(){return Object(U.jsxs)("div",{id:"website",children:[Object(U.jsxs)(w.a,{Container:!0,disableGutters:!0,maxWidth:"false",direction:"column",alignItems:"center",id:"content",children:[Object(U.jsxs)(w.a,{item:!0,xs:12,id:"title",children:[Object(U.jsx)("h1",{children:" Crypto gains "}),Object(U.jsx)("h4",{children:" for Shakepay and Ethereum mining"})]}),Object(U.jsx)(w.a,{item:!0,xs:12,id:"results",children:Object(U.jsx)(X,{})})]}),Object(U.jsx)("div",{id:"footer",children:Object(U.jsx)("p",{children:"Powered By Coingecko API and Etherscan API"})})]})}}]),a}(n.Component),$=function(e){e&&e instanceof Function&&a.e(3).then(a.bind(null,234)).then((function(t){var a=t.getCLS,n=t.getFID,c=t.getFCP,i=t.getLCP,l=t.getTTFB;a(e),n(e),c(e),i(e),l(e)}))};l.a.render(Object(U.jsx)(c.a.StrictMode,{children:Object(U.jsx)(Z,{})}),document.getElementById("root")),$()}},[[152,1,2]]]);
//# sourceMappingURL=main.dd077b83.chunk.js.map