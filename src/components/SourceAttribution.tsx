import Icon from "./Icon";

interface Source {
  label: string;
  url: string;
}

interface SourceAttributionProps {
  sources: Source[];
  updatedAt?: string;
}

export default function SourceAttribution({ sources, updatedAt }: SourceAttributionProps) {
  return (
    <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-400">
      <div className="flex items-center gap-1 mb-1">
        <Icon name="info" size={14} className="text-gray-400" />
        <span className="font-medium text-gray-500">出典・情報元</span>
      </div>
      <ul className="space-y-0.5">
        {sources.map((source) => (
          <li key={source.url}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600 underline underline-offset-2"
            >
              {source.label}
            </a>
          </li>
        ))}
      </ul>
      {updatedAt && (
        <p className="mt-1 text-gray-400">最終更新: {updatedAt}</p>
      )}
    </div>
  );
}
