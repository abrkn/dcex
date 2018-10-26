import React from 'react';
import { Link } from '../routes';
import { get } from 'lodash';
import Script from 'bcoin/lib/script/script';
import sidechains from '../sidechains';

function reverseBuffer(src) {
  var buffer = new Buffer(src.length);

  for (var i = 0, j = src.length - 1; i <= j; ++i, --j) {
    buffer[i] = src[j];
    buffer[j] = src[i];
  }

  return buffer;
}

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
        Unable to decode address (<span>{value === null ? 'Unknown' : value}</span> BTC -{' '}
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
  const script = Script.fromJSON(scriptPubKey.hex);

  if (scriptPubKey && scriptPubKey.type === 'anyone_can_spend') {
    return <div>🎁 Anyone-can-spend {value} BTC</div>;
  }

  const isCommitment = script.isCommitment();

  if (isCommitment) {
    return <div>💍 SegWit commitment</div>;
  }

  const criticaldata = script.isCriticalHashCommit() && script.getCriticalData();
  const bmmRequest = criticaldata && criticaldata.getBmmRequest();

  if (bmmRequest) {
    const sidechain = sidechains[bmmRequest.sidechainNumber];
    const hashCriticalRev = reverseBuffer(criticaldata.hashCritical);
    const hashCriticalRevHex = hashCriticalRev.toString('hex');
    const hashCriticalHex = criticaldata.hashCritical.toString('hex');

    return (
      <div>
        🚗 Mined{' '}
        <a href={`${sidechain.explorerUrl}/blindhash/${hashCriticalRevHex}`} title={hashCriticalHex}>
          block
        </a>{' '}
        on {sidechain.name}
      </div>
    );
  }

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
    <div className="container">
      <div className="tx-inputs">
        {vin.map(vin => (
          <BlockTransactionInput key={vin.vout} vin={vin} />
        ))}
      </div>
      <div className="tx-arrow">➡</div>
      <div className="tx-outputs">
        {vout.map(vout => (
          <BlockTransactionOutput key={vout.n} vout={vout} />
        ))}
      </div>
      <style jsx>{`
        .container {
          display: flex;
        }

        .tx-inputs {
          width: 50%;
        }

        .tx-outputs {
          width: 50%x;
        }

        .tx-arrow {
          vertical-align: middle;
          width: 4rem;
          display: flex;
          justify-content: center;
          flex-direction: column;
          text-align: center;
          font-size: 2rem;
        }
      `}</style>
    </div>
  );
};
