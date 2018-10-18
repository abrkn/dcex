import React from 'react';
import { Link } from '../routes';

const BlockTransactionInput = ({ input }) => {
  const { txid, coinbase, vout } = input;

  if (coinbase) {
    return <div>Mined</div>;
  }

  if (txid) {
    return (
      <div>
        <Link route="tx" params={{ hash: txid }}>
          <a>
            {txid}:{vout}
          </a>
        </Link>
      </div>
    );
  }

  return <div>Unknown</div>;
};

const BlockTransactionOutput = ({ output }) => {
  const { value, addresses } = output;

  const address = addresses && addresses.length && addresses[0];

  return (
    <div>
      {address && (
        <span>
          <Link route="address" params={{ address }}>
            <a>{address}</a>
          </Link>
          <span> </span>
        </span>
      )}
      {value} BTC
    </div>
  );
};

export default ({ tx }) => {
  const { inputs, outputs } = tx;
  return (
    <div>
      <div>
        <h3>Inputs</h3>
        {inputs.map(input => (
          <BlockTransactionInput key={input.vout} input={input} />
        ))}
      </div>
      <div>
        <h3>Outputs</h3>
        {outputs.map(output => (
          <BlockTransactionOutput key={output.n} output={output} />
        ))}
      </div>
    </div>
  );
};
