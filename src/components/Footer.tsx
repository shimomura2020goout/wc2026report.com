"use client";

import Link from "next/link";
import Icon from "./Icon";
import { useTranslation } from "@/i18n/client";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#1a1a2e] text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Icon name="sports_soccer" size={20} />
              {t("header.siteName")}
            </h3>
            <p className="text-sm leading-relaxed">
              {t("footer.siteDescription")}
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">{t("footer.matchInfo")}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/matches" className="hover:text-white transition-colors">{t("footer.matchSchedule")}</Link></li>
              <li><Link href="/groups" className="hover:text-white transition-colors">{t("footer.groupStage")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">{t("footer.totoWatch")}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/toto" className="hover:text-white transition-colors">{t("footer.totoZone")}</Link></li>
              <li><Link href="/watch" className="hover:text-white transition-colors">{t("footer.watchGuide")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">{t("footer.other")}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">{t("footer.aboutSite")}</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">{t("footer.privacyPolicy")}</Link></li>
            </ul>
            <div className="mt-4">
              <a
                href="https://line.me/R/ti/p/@517lriub"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#06C755] hover:bg-[#05b34d] text-white text-sm font-bold px-4 py-2.5 rounded-lg transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
                LINE で友だち追加
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-8 text-sm text-gray-500">
          <p className="text-center">&copy; 2026 {t("header.siteName")}. All rights reserved.</p>
          <p className="text-center mt-1">{t("footer.disclaimer")}</p>
          <div className="mt-3 text-center text-xs text-gray-600">
            <p>{t("footer.sourceLabel")}
              <a href="https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400 ml-1">FIFA.com</a> /
              <a href="https://www.jfa.jp/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400 ml-1">JFA</a> /
              <a href="https://www.toto-dream.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400 ml-1">toto</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
