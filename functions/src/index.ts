// instructions:
// cd functions to get into this folder
// then you can run commands
//tutrial: reached until 13:30
// https://www.youtube.com/watch?v=2u6Zb36OQjM 

// You can use ESM or CJS.
// ESM:
import * as v2 from 'firebase-functions/v2';
import {onRequest} from "firebase-functions/v2/https";
// import * as v1 from 'firebase-functions/v1'; //difffrernt version options

// CJS
//const functions = require('firebase-functions');
type Indexable = { [key: string]: any};


export const helloworld = v2.https.onRequest((request, response) => {
    // this function pretends we are a webstie and the
    // user selected an item and we want to send them
    // the description of their item.
    const name = request.params[0];
    const items : Indexable= {lamp: "this is a lamp", chair: "good chair"};
    const message = items[name];
    response.send(`<h1>${message}</h1>`);
});

export const optimalHelloWorld = onRequest((request, response) => {
  // same funciton as before but optimized in the line above
  const name = request.params[0];
  const items : Indexable= {lamp: "this is a lamp", chair: "good chair"};
  const message = items[name];
  response.send(`<h1>${message}</h1>`);
});