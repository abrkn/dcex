import React from 'react';
import { Link } from '../routes';

const BlockTransactionInput = ({ vin }) => {
  const { txid, coinbase, vout } = vin;

  if (coinbase) {
    return (
      <div>
        <p>Mined</p>
        <pre>{new Buffer(coinbase, 'hex').toString().replace(/[^ -~]+/g, '?')}</pre>
      </div>
    );
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

const BlockTransactionOutput = ({ vout }) => {
  const { value, addresses } = vout;

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
  const { vin, vout } = tx;
  return (
    <div>
      <div>
        <h3>Inputs</h3>
        {vin.map(vin => (
          <BlockTransactionInput key={vin.vout} vin={vin} />
        ))}
      </div>
      <div>
        <h3>Outputs</h3>
        {vout.map(vout => (
          <BlockTransactionOutput key={vout.n} vout={vout} />
        ))}
      </div>
    </div>
  );
};
