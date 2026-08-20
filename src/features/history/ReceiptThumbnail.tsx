import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { useObjectUrl } from '../../hooks/useObjectUrl';

interface Props {
  purchaseId: string;
  onOpen: (url: string) => void;
}

export default function ReceiptThumbnail({ purchaseId, onOpen }: Props) {
  const receipt = useLiveQuery(
    () => db.receipts.where('purchaseId').equals(purchaseId).first(),
    [purchaseId],
  );
  const url = useObjectUrl(receipt?.blob);

  if (!url) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xl dark:bg-gray-800">
        🧾
      </div>
    );
  }

  return (
    <button onClick={() => onOpen(url)} className="h-14 w-14 shrink-0 overflow-hidden rounded-xl">
      <img src={url} alt="Kassenbon" className="h-full w-full object-cover" />
    </button>
  );
}
