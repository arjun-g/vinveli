import { Modal, Form, Loading, Button, Space, Dialog } from "antd-mobile";
import { useEffect, useState } from "react";
import { Dropdown } from "../../components/dropdown";
import { useStore } from "../../store";

export function AddFunds({
    onClose
}){
    const wallet = useStore(state => state.wallet);
    const [supportedCountries, setSupportedCountries] = useState([]);
    const [supportedCurrencies, setSupportedCurrencies] = useState([]);
    const [currentCountry, setCurrentCountry] = useState(null);
    const [currentCurrency, setCurrentCurrency] = useState(null);

    const [retrivingAccount, setRetrivingAccount] = useState(true);
    const [account, setAccount] = useState(null);
    useEffect(() => {
        useStore.getState().getWalletCountries().then(countries => {
            setSupportedCountries(countries);
        });
        useStore.getState().getWallet();
    }, []);
    return <Modal title="Account Details" onClose={onClose} showCloseButton={true} visible={true} content={<div>
        {wallet && <div>

        </div>}
        <Form>
            <Form.Item name={"country"} label="Select Your Country">
                <Dropdown datasource={supportedCountries} onChange={(country) => {
                    setCurrentCountry(country);
                    useStore.getState().getWalletCurrencies(country.value).then(currencies => {
                        setSupportedCurrencies(currencies);
                    })
                }} />
            </Form.Item>
            <Form.Item name={"currency"} label="Select Your Currency">
                <Dropdown datasource={supportedCurrencies} onChange={currency => {
                    setCurrentCurrency(currency);
                }} />
            </Form.Item>
            <Space style={{ paddingTop: "12px" }} direction="vertical">
                <Space direction="vertical">
                    <span className="txt-small">Account Numbers</span>
                    {currentCountry && currentCurrency && wallet?.vas.filter(va => va.country_iso === currentCountry.value && va.currency === currentCurrency.value).map(va => {
                        return <Space direction="vertical" style={{ marginBottom: "16px" }}>
                            <span>{va.account_id}</span>
                            <Button size="mini" onClick={() => {
                                useStore.getState().depositAmount({
                                    account: va.issuing_id,
                                    amount: 1000000,
                                    currency: currentCurrency.value
                                }).then(() => {
                                    Dialog.alert({
                                        content: "Funds Added",
                                        confirmText: "OK"
                                    });
                                })
                            }}>Simulate Payment</Button>
                        </Space>
                    })}
                </Space>
                <div>
                    {currentCountry && currentCurrency && <Button size="small" color="primary" onClick={() => {
                        useStore.getState().addVirtualAccount(currentCountry.value, currentCurrency.value);
                    }}>Add Account</Button>}
                </div>
            </Space>
        </Form>
    </div>} />
}