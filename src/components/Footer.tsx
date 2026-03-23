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
              {t("footer.description")}
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
            <h4 className="text-white font-semibold mb-4">{t("footer.others")}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">{t("footer.aboutSite")}</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">{t("footer.privacyPolicy")}</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-8 text-sm text-gray-500">
          <p className="text-center">&copy; 2026 {t("header.siteName")}. All rights reserved.</p>
          <p className="text-center mt-1">{t("footer.disclaimer")}</p>
          <div className="mt-3 text-center text-xs text-gray-600">
            <p>{t("footer.sources")}:
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
