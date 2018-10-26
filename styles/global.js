import React from 'react';

export default () => (
  <style jsx global>{`
    @import url('https://fonts.googleapis.com/css?family=Source+Code+Pro|Source+Sans+Pro:300,400,600,700,900');

    a {
      color: #000;
    }

    /* Sticky footer. See https://codepen.io/anon/pen/BqMBpO */
    html {
      height: 100%;
    }

    body,
    #__next,
    page {
      min-height: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    main {
      flex: 1 0 auto;
    }

    body {
      margin: 0;
    }

    footer {
      padding: 2em;
    }

    /* Global */
    body {
      font-family: sans-serif;
      font-family: 'Source Sans Pro', sans-serif;
      font-size: 16px;
    }
  `}</style>
);
