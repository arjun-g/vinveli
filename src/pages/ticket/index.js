import {
  Popup,
  Form,
  Input,
  DatePicker,
  Button,
  Space,
  Dialog,
  Modal,
} from "antd-mobile";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { Dropdown } from "../../components/dropdown";
import { useStore } from "../../store";
import style from "./ticket.module.css";
import { SeatSelection } from "./seatselection";
import QRCode from "react-qr-code";
import { AddFunds } from "./addfunds";
import { Icon } from "../../components/icons";

export function Ticket({ show, mission }) {
  console.log("RE RENDERING");
  const navigate = useNavigate();
  const geo = useStore((state) => state.geo);
  const identities = useStore((state) => state.identities);
  const user = useStore((state) => state.currentUser);
  const wallet = useStore((state) => state.wallet);
  const [selectedSeats, setSelectedSeats] = useState(null);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  console.log("IG", geo, identities);
  useEffect(() => {
    if (show) {
      useStore
        .getState()
        .getUser()
        .then((user) => {});
      useStore.getState().getOfficialIdentities();
      if (geo.countries.length === 0) {
        useStore
          .getState()
          .getCountries()
          .then(() => {
            // return useStore.getState().getStates("United States");
          })
          .then(() => {
            // return useStore.getState().getCities("United States", "New York");
          });
      }
    }
  }, [show]);
  useEffect(() => {
    if(user?.firstName)
      useStore.getState().getWallet();
  }, [user?.firstName])
  return (
    <Popup
      visible={show}
      position={"right"}
      bodyClassName={style.ticket}
      maskClassName={style.ticketmask}
    >
      <div className={style.content}>
        {<Popup visible={bookingSuccess} bodyStyle={{ height: "100vh" }}>
          <div style={{ height: "100%", textAlign: "center", display: "flex", flexDirection: "column", gap: "24px", alignItems: "center", justifyContent: "center" }}>
            <span className="txt-title" style={{ fontWeight: 400 }}>SUCCESS</span>
            <span className="txt-title" style={{ fontWeight: 400 }}><Icon style={{ fontSize: "64px" }} icon={"task_alt"} filled={false} /></span>
            <span className="txt-medium">TICKET BOOKED SUCCESSFULLY</span>
            <div style={{ height: "0" }} />
            <div>
              <Button color="primary" onClick={() => {
                navigate("/bookings");
              }}>View Ticket</Button>
            </div>
          </div>
        </Popup>}
        {
          <Popup visible={user?.wallet && selectedSeats} position={"right"}
          bodyClassName={style.ticket}
          maskClassName={style.ticketmask}>
            {user?.wallet && selectedSeats && <Space direction="vertical" className={style.buy}>
              <span className={`txt-subtitle ${style.title}`}>
                Pay with your wallet
              </span>
              <div className={style.walletcontainer}>
                <div className={style.wallet}>
                  <div className={style.background} />
                  <div className={style.left}>
                    <span className="txt-medium">WALLET</span>
                    <span className="txt-subtitle">{`${user.firstName} ${user.lastName}`}</span>
                    <span className="txt-medium">VALID TILL 01/01/2050</span>
                  </div>
                  <div className={style.right}>
                    <QRCode
                      value={user.wallet.replace("ewallet_", "")}
                      level="H"
                      size={"125"}
                    />
                  </div>
                  <span className={style.code}>
                    {user.wallet.replace("ewallet_", "")}
                  </span>
                </div>
              </div>
              <div className={style.funds}>
                <div>
                  <span>Available Funds</span>
                  <span style={{ flex: "1 1 100%" }} />
                  <div className={style.moneys}>
                    {(!wallet || wallet?.accounts.length === 0) && "$0"}
                    {wallet?.accounts.map((account) => {
                      return (
                        <span>
                          <strong>
                            {Intl.NumberFormat().format(account.balance)}{" "}
                            {account.currency}
                          </strong>
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <Button
                    size="mini"
                    color="primary"
                    onClick={() => {
                      setShowAddFunds(true);
                    }}
                  >
                    Add Funds
                  </Button>
                </div>
              </div>
              <div className={style.message}>
                <span className="txt-subtitle">PAY</span>
                <span className="txt-title">
                  ${Intl.NumberFormat().format(mission.cost * selectedSeats.length)}
                </span>
              </div>
              <div className={style.action}>
                <Button color="primary" block onClick={() => {
                    useStore.getState().buyTicket({
                        missionId: mission._id,
                        count: selectedSeats.length,
                        deposit: false,
                        seats: selectedSeats
                    }).then(ticket => {
                      if(ticket.error_code){
                        if(ticket.error_code === "NOT_ENOUGH_FUNDS"){
                          Dialog.alert({
                            content: "Insufficient Funds",
                            confirmText: "OK"
                          });
                        }
                      }else{
                        useStore.getState().getTickets();
                        setBookingSuccess(true);
                      }
                    });
                }}>
                  Pay with Wallet
                </Button>
                <Button color="default" block onClick={() => {
                    useStore.getState().buyTicket({
                        missionId: mission._id,
                        count: selectedSeats.length,
                        deposit: true,
                        seats: selectedSeats
                    }).then(ticket => {
                      if(ticket.error_code){
                        if(ticket.error_code === "NOT_ENOUGH_FUNDS"){
                          Dialog.alert({
                            content: "Insufficient Funds",
                            confirmText: "OK"
                          });
                        }
                      }else{
                        useStore.getState().getTickets();
                        setBookingSuccess(true);
                      }
                    });
                }}>
                  Deposit ${Intl.NumberFormat().format(mission.cost / 4)} with
                  Wallet
                </Button>
              </div>
            </Space>}
            {showAddFunds && (
              <AddFunds
                onClose={() => {
                  setShowAddFunds(false);
                }}
              />
            )}
          </Popup>
        }
        {!selectedSeats && (
          <SeatSelection
            onSeatsChanged={(seats) => {
              setSelectedSeats(seats);
            }}
          />
        )}
        {!user?.wallet && selectedSeats && (
          <div className={style.profile}>
            <span className={`txt-subtitle`}>
              Complete your Profile to proceed
            </span>
            <Form
              onFinish={(e) => {
                console.log("E", e);
                useStore
                  .getState()
                  .updateUser({
                    firstName: e.firstName,
                    lastName: e.lastName,
                    dob: dayjs(e.birthday).format("YYYY-MM-DD"),
                    phonenumber: e.phonenumber,
                    address: {
                      line1: e.address_line_1,
                      line2: e.address_line_2,
                      country: e.address_country.value,
                      state: e.address_state.value,
                      city: e.address_city.value,
                      zip: e.address_zip,
                    },
                    identification: {
                      type: e.identification_type.value,
                      number: e.identification_number,
                    },
                  })
                  .then(async () => {
                    await useStore.getState().createWallet({});
                  });
              }}
              footer={
                <Button block type="submit" color="primary">
                  Update Profile
                </Button>
              }
            >
              <Form.Header>Personal</Form.Header>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true, message: "Required" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true, message: "Required" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="birthday"
                label="Date of Birth"
                trigger="onConfirm"
                onClick={(e, datePickerRef) => {
                  console.log("GOT CLIEK", e, datePickerRef);
                  datePickerRef.current?.open();
                }}
                rules={[{ required: true, message: "Required" }]}
              >
                <DatePicker
                  min={new Date(1970, 1, 1)}
                  max={new Date(2006, 12, 31)}
                  cancelText="Cancel"
                  confirmText="Select"
                >
                  {(value) => (value ? dayjs(value).format("YYYY/MM/DD") : "⠀")}
                </DatePicker>
              </Form.Item>
              <Form.Item
                name="phonenumber"
                label="Phone number"
                rules={[{ required: true, message: "Required" }]}
              >
                <Input />
              </Form.Item>
              <Form.Header>Address</Form.Header>
              <Form.Item
                name="address_line_1"
                label="Line 1"
                rules={[{ required: true, message: "Required" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="address_line_2"
                label="Line 2"
                rules={[{ required: true, message: "Required" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="address_country"
                label="Country"
                rules={[{ required: true, message: "Required" }]}
              >
                <Dropdown
                  datasource={geo.countries}
                  title="Select Country"
                  onChange={(country) => {
                    useStore.getState().getStates(country.label);
                  }}
                />
              </Form.Item>
              <Form.Item
                name="address_state"
                label="State"
                rules={[{ required: true, message: "Required" }]}
              >
                <Dropdown
                  datasource={geo.states}
                  value={geo.current.state}
                  onChange={(state) => {
                    useStore
                      .getState()
                      .getCities(geo.current.country.label, state.label);
                  }}
                />
              </Form.Item>
              <Form.Item
                name="address_city"
                label="City"
                rules={[{ required: true, message: "Required" }]}
              >
                <Dropdown datasource={geo.cities} />
              </Form.Item>
              <Form.Item
                name="address_zip"
                label="Zip"
                rules={[{ required: true, message: "Required" }]}
              >
                <Input />
              </Form.Item>
              <Form.Header>Identification</Form.Header>
              <Form.Item
                name="identification_type"
                label="Type"
                rules={[{ required: true, message: "Required" }]}
              >
                <Dropdown
                  datasource={
                    (geo.current.country &&
                      identities.filter(
                        (identity) =>
                          identity.country === geo.current.country.value
                      )) ||
                    []
                  }
                />
              </Form.Item>
              <Form.Item
                name="identification_number"
                label="Identification Number/Code"
                rules={[{ required: true, message: "Required" }]}
              >
                <Input />
              </Form.Item>
            </Form>
          </div>
        )}
        {<div className={style.wallets}></div>}
      </div>
    </Popup>
  );
}
