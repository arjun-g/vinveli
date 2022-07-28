import { Input, Picker, Popup, SearchBar, List, Space } from "antd-mobile";
import { useEffect, useState, memo } from "react";
import style from "./dropdown.module.css";

export function Dropdown({
    datasource = [],
    value,
    title,
    onChange
}){
    const [showPicker , setShowPicker] = useState(false);
    const [currentData, setCurrentData] = useState(datasource);
    const [currentValue, setCurrentValue] = useState(value);
    useEffect(() => {
        setCurrentData(datasource);
    }, [datasource.map(data => data.value).join(",")]);
    useEffect(() => {
        console.log("SELECTED CAHNGE", currentValue, value);
        setCurrentValue(value);
    }, [value]);
    return <>
        <Input value={(currentValue && currentValue.label) || ""} onFocus={(e) => {
            e.target.blur();
            setShowPicker(true);
        }}/>
        <Popup
            visible={showPicker}
            className={style.dropdownpopup}
            bodyClassName={style.dropdownpopupbody}
            onMaskClick={() => {
                setShowPicker(false);
            }}
        >
            <div className={style.search}>
                <Space direction="vertical" block={true}>
                    <span className="txt-medium">{title}</span>
                    <SearchBar  onChange={value => {
                        console.log("data", datasource, value, datasource.filter(data => data.label.toLowerCase().indexOf(value.toLowerCase()) >= 0));
                        setCurrentData(datasource.filter(data => data.label.toLowerCase().indexOf(value.toLowerCase()) >= 0))
                    }}  />
                </Space>
            </div>
            <div className={style.list}>
                <List>
                    {currentData.map(data => {
                        return <List.Item onClick={() => {
                            setCurrentValue(data);
                            onChange && onChange(data);
                            setShowPicker(false);
                        }}>{data.label}</List.Item>;
                    })}
                </List>
            </div>
        </Popup>
    </>
}