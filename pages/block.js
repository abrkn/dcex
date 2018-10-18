import React from 'react';
import App from '../components/App';
import Header from '../components/Header';
// import Submit from '../components/Submit';
import Block from '../components/Block';

// export default (...args) => {
//   console.log('PAGE', args);

//   return (
//     <App>
//       <Header />
//       <Block />
//     </App>
//   );
// };

export default class Blog extends React.Component {
  static async getInitialProps({ query }) {
    return { query };
  }

  render() {
    const { query } = this.props;

    return (
      <App>
        <Header />
        <Block {...{ query }} />
      </App>
    );
  }
}
