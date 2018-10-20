import React from 'react';
import { Link } from '../routes';
import { get } from 'lodash';

const BlockTransactionInput = ({ vin }) => {
  const { prevTxId, coinbase, vout, value } = vin;

  if (coinbase) {
    return (
      <div>
        <p>Mined</p>
        <pre>{new Buffer(coinbase, 'hex').toString().replace(/[^ -~]+/g, '?')}</pre>
      </div>
    );
  }

  if (prevTxId) {
    return (
      <div>
        <Link route="tx" params={{ txId: prevTxId }}>
          <a>
            {prevTxId}:{vout}
          </a>
        </Link>
        {value && <span> {value} BTC</span>}
      </div>
    );
  }

  return <div>Unknown</div>;
};

const BlockTransactionOutput = ({ vout }) => {
  const { value } = vout;
  const scriptPubKey = vout.scriptPubKey && JSON.parse(vout.scriptPubKey);
  const address = scriptPubKey && get(scriptPubKey, 'addresses.0');

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
  const {
    vinsByTxId: { nodes: vin },
    voutsByTxId: { nodes: vout },
  } = tx;

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
