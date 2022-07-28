import { NavBar } from "antd-mobile";
import { useNavigate } from "react-router-dom";

import { classNames } from "../utils";
import { Icon } from "../components/icons";
import logoWhite from "../images/logo-white.png";
import style from "./page.module.css";

export function Page({
    children,
    showBack = true
}){
    const navigate = useNavigate();
    return <div className={style.page}>
        <NavBar className={style.navbar} backArrow={showBack} onBack={() => {
            navigate(-1);
        }}>
            <img src={logoWhite} className={style.logo} />
        </NavBar>
        <div className={style.content}>
            {children}
        </div>
    </div>
}