import Link from "next/link";
import Icon from "./Icon";

export default function Footer() {
  return (
    <footer className="bg-[#1a1a2e] text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Icon name="sports_soccer" size={20} />
              W杯2026 × toto
            </h3>
            <p className="text-sm leading-relaxed">
              FIFA ワールドカップ 2026 の試合情報とtoto予想を提供する総合情報サイトです。
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">試合情報</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/matches" className="hover:text-white transition-colors">試合日程</Link></li>
              <li><Link href="/groups" className="hover:text-white transition-colors">グループステージ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">toto・視聴</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/toto" className="hover:text-white transition-colors">totoゾーン</Link></li>
              <li><Link href="/watch" className="hover:text-white transition-colors">視聴ガイド</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">その他</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">サイトについて</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">プライバシーポリシー</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-8 text-sm text-gray-500">
          <p className="text-center">&copy; 2026 W杯2026 × toto. All rights reserved.</p>
          <p className="text-center mt-1">当サイトはFIFA、JFA、toto公式サイトとは関係のない非公式情報サイトです。</p>
          <div className="mt-3 text-center text-xs text-gray-600">
            <p>試合情報出典:
              <a href="https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400 ml-1">FIFA.com</a> /
              <a href="https://www.jfa.jp/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400 ml-1">JFA公式</a> /
              <a href="https://www.toto-dream.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400 ml-1">toto公式</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
