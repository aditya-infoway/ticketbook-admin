import{j as e,B as p,n as u,I as f}from"./index-DJz5zNJ6.js";import{F as b,a as j,b as g,c as v}from"./PlusIcon-BW6MQqLH.js";import{F as k}from"./MagnifyingGlassIcon-ChB2GEJN.js";function F(c,n,o){const l=n.map(r=>r.header),i=c.map(r=>n.map(s=>{const x=r[s.key];return`"${(s.format?s.format(x,r):String(x??"")).replace(/"/g,'""')}"`}).join(",")),d=[l.join(","),...i].join(`
`),m=new Blob(["\uFEFF"+d],{type:"text/csv;charset=utf-8;"}),t=URL.createObjectURL(m),a=document.createElement("a");a.href=t,a.download=`${o}.csv`,a.click(),URL.revokeObjectURL(t)}function $(c,n,o,l){const i=n.map(a=>`<th>${a.header}</th>`).join(""),d=c.map(a=>`<tr>${n.map(s=>{const x=a[s.key];return`<td>${s.format?s.format(x,a):String(x??"")}</td>`}).join("")}</tr>`).join(""),m=`<!DOCTYPE html>
<html>
<head>
  <title>${o}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; }
    h1 { font-size: 18px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
    th { background: #1a2fa8; color: white; }
    tr:nth-child(even) { background: #f5f5f5; }
  </style>
</head>
<body>
  <h1>${o}</h1>
  <table>
    <thead><tr>${i}</tr></thead>
    <tbody>${d}</tbody>
  </table>
</body>
</html>`,t=window.open("","_blank");t&&(t.document.write(m),t.document.close(),t.document.title=l,t.focus(),t.print())}function R({title:c,createLabel:n,searchPlaceholder:o,table:l,onCreate:i,showFilters:d,onToggleFilters:m,onExportExcel:t,onExportPdf:a,filterPanel:r}){return e.jsxs("div",{className:"table-toolbar px-(--margin-x) pt-4",children:[e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-4",children:[e.jsx("h2",{className:"dark:text-dark-50 text-xl font-medium tracking-wide text-gray-800",children:c}),e.jsxs("div",{className:"flex flex-wrap items-center gap-2",children:[e.jsxs(p,{variant:"outlined",className:"h-9 gap-2 rounded-md px-3 text-sm",onClick:m,children:[e.jsx(b,{className:u("size-4",d&&"text-primary-600")}),e.jsx("span",{children:"Filter"})]}),e.jsxs(p,{variant:"outlined",className:"h-9 gap-2 rounded-md px-3 text-sm",onClick:t,children:[e.jsx(j,{className:"size-4 text-success-600"}),e.jsx("span",{children:"Excel"})]}),e.jsxs(p,{variant:"outlined",className:"h-9 gap-2 rounded-md px-3 text-sm",onClick:a,children:[e.jsx(g,{className:"size-4 text-error-600"}),e.jsx("span",{children:"PDF"})]}),e.jsxs(p,{color:"primary",className:"h-9 gap-2 rounded-md px-4 text-sm",onClick:i,children:[e.jsx(v,{className:"size-4"}),e.jsx("span",{children:n})]})]})]}),e.jsx("div",{className:"mt-4 max-w-sm",children:e.jsx(f,{value:l.getState().globalFilter,onChange:s=>l.setGlobalFilter(s.target.value),prefix:e.jsx(k,{className:"size-4"}),classNames:{input:"ring-primary-500/50 h-9 text-sm focus:ring-3"},placeholder:o})}),d&&r&&e.jsx("div",{className:"mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-dark-500 dark:bg-dark-600",children:r})]})}export{R as M,F as a,$ as e};
