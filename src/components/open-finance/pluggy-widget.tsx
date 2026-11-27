'use client';

import { PluggyConnect, type PluggyConnectProps } from 'react-pluggy-connect';

type Props = {
  connectToken: string;
  connectorIds: number[];
  products: PluggyConnectProps['products'];
  onSuccess: (itemId: string) => void;
  onClose: () => void;
};

/** O widget abre ao montar. Só renderize com um Connect Token novo. */
export function PluggyWidget({ connectToken, connectorIds, products, onSuccess, onClose }: Props) {
  return (
    <PluggyConnect
      connectToken={connectToken}
      includeSandbox={false}
      products={products}
      {...(connectorIds.length ? { connectorIds } : {})}
      onSuccess={(data) => {
        const itemId = data.item?.id;
        if (itemId) onSuccess(itemId);
      }}
      onError={() => onClose()}
      onClose={onClose}
    />
  );
}
