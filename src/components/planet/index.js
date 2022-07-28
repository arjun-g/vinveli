import { classNames } from "../../utils";
import style from "./planet.module.css";

export function PlanetBackground({
    className,
    planet
}){
    return <div className={classNames([style.planet, className])}>
        {planet === "earth" && <iframe src='https://my.spline.design/untitled-a0d9fa1838d32b01d10f8d297301f027/' frameborder='0' width='100%' height='100%' id="earth"></iframe>}
        {planet === "mars" && <iframe src='https://my.spline.design/mars-c3c0ddec371bf20c624a8e931f94e3b3/' frameborder='0' width='100%' height='100%' id="mars"></iframe>}
        {planet === "moon" && <iframe src='https://my.spline.design/moon-01199ad35857b8216a2c4c66589563ac/' frameborder='0' width='100%' height='100%' id="moon"></iframe>}
        {planet === "iss" && <iframe src='https://my.spline.design/iss-b8de3a7c9d2487ec62e75e8f162180e2/' frameborder='0' width='100%' height='100%' id="iss"></iframe>}
        {planet === "shuttle" && <iframe src='https://my.spline.design/untitled-a0d9fa1838d32b01d10f8d297301f027/' frameborder='0' width='100%' height='100%' id="shuttle"></iframe>}
    </div>
}