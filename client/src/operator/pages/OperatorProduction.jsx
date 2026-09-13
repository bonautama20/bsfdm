import React from "react";
import { useNavigate } from "react-router-dom";
import { Layers, Scale, Egg, Sprout, Users, Droplets, ChevronRight } from "lucide-react";
import BackHeader from "../components/BackHeader.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function OperatorProduction() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const items = [
    { to: "/operator/production/biopond", icon: Layers, label: t("operatorHome.menuBiopond"), sub: t("operatorHome.menuBiopondSub") },
    { to: "/operator/production/maggot-harvest", icon: Scale, label: t("operatorHome.menuMaggotHarvest"), sub: t("operatorHome.menuMaggotHarvestSub") },
    { to: "/operator/production/egg-harvest", icon: Egg, label: t("operatorHome.menuEggHarvest"), sub: t("operatorHome.menuEggHarvestSub") },
    { to: "/operator/production/kasgot", icon: Sprout, label: t("operatorHome.menuKasgot"), sub: t("operatorHome.menuKasgotSub") },
    { to: "/operator/production/breeder", icon: Users, label: t("operatorHome.menuBreeder"), sub: t("operatorHome.menuBreederSub") },
    { to: "/operator/production/feed", icon: Droplets, label: t("operatorHome.menuFeed"), sub: t("operatorProduction.feedSub") },
  ];
  return (
    <>
      <BackHeader title={t("operatorProduction.title")} to="/operator" />
      <div className="op-content">
        {items.map((item) => (
          <button key={item.to} className="op-list-card" style={{ width: "100%" }} onClick={() => navigate(item.to)}>
            <div className="ic-wrap"><item.icon size={22} /></div>
            <div className="body">
              <div className="lbl">{item.label}</div>
              <div className="sub">{item.sub}</div>
            </div>
            <ChevronRight size={18} className="chev" />
          </button>
        ))}
      </div>
    </>
  );
}
