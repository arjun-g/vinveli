import { classNames } from "../../utils";
import style from "./button.css";

const BUTTON_TYPE = {
    PRIMARY: "primary",
    SECONDARY: "secondary"
}

export function Button({
    children,
    type
}){
    return <button className={classNames({
        [style.button]: true,
        [style.primary]: type === BUTTON_TYPE.PRIMARY,
        [style.secondary]: type === BUTTON_TYPE.SECONDARY
    })}>
        {children}
    </button>
}

