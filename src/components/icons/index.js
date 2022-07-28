export function Icon({
    icon,
    filled,
    style,
    className
}){
    return <span className={`material-symbols-rounded ${filled ? "" : "material-symbols-rounded-filled"} ${className}`} style={style}>
        {icon}
    </span>
}