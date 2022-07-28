export function classNames(classes){
    if(!classes) return "";
    if(Array.isArray(classes)){
        return classes.join(" ");
    }
    else{
        return Object.keys(classes).filter(cls => !!classes[cls]).join(" ");
    }
}

export const getCookie = (name) => (
    document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
)