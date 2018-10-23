import React from 'react';
import { Link } from '../routes';
import { get } from 'lodash';

const BlockTransactionInput = ({ vin }) => {
  const { prevTxId, coinbase, vout, value, address } = vin;

  if (coinbase) {
    return (
      <div>
        <p>Mined</p>
        <pre>{new Buffer(coinbase, 'hex').toString().replace(/[^ -~]+/g, '?')}</pre>
      </div>
    );
  }

  if (address) {
    return (
      <div>
        <Link route="address" params={{ address }}>
          <a>{address}</a>
        </Link>{' '}
        ({value && <span>{value} BTC</span>} -{' '}
        <Link route="tx" params={{ txId: prevTxId, vout }}>
          <a>Output</a>
        </Link>
        )
      </div>
    );
  }

  if (prevTxId) {
    return (
      <div>
        Unable to decode address (<span>{value === null ? 'Unknown' : value}</span> BTC) -{' '}
        <Link route="tx" params={{ txId: prevTxId, vout }}>
          <a>Output</a>
        </Link>
        )
      </div>
    );
  }

  return <div>Unknown</div>;
};

const BlockTransactionOutput = ({ vout }) => {
  const { value, spendingTxId, spendingTxN } = vout;
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
      {!address && <span>No address</span>}
      <span>
        {' '}
        (
        {spendingTxId && (
          <Link route="tx" params={{ txId: spendingTxId, n: spendingTxN }}>
            <a>Spent</a>
          </Link>
        )}
        {!spendingTxId && <span>Unspent</span>})
      </span>{' '}
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
        <table>
          <tr>
            <td style={{ width: '60%', verticalAlign: 'top' }}>
              {vin.map(vin => (
                <BlockTransactionInput key={vin.vout} vin={vin} />
              ))}
            </td>
            <td style={{ verticalAlign: 'middle' }}>➡</td>
            <td style={{ width: '38%', verticalAlign: 'top' }}>
              {vout.map(vout => (
                <BlockTransactionOutput key={vout.n} vout={vout} />
              ))}
            </td>
          </tr>
        </table>
      </div>
    </div>
  );
};
