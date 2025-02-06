import { Button, Modal } from 'antd';
import React, { createContext, useState } from 'react';
import { getSettingZalo, getZaloAuthorize, getZaloUserName, getZaloUserPhone } from '../helper/zaloSDK';
import { ReactComponent as WarningIcon } from '../assets/icons/warning.svg'

const GlobalContext = createContext();

const WarningNotify = ({ isModalOpen, onClose, onConfirm }) => {
    return (
        <>
            <Modal title="" visible={isModalOpen} footer={null} closable={false} className="my-modal text-center" onClose={onClose}>
                <WarningIcon style={{ margin: 'auto', width: 50, height: 50, color: "#FAAD14" }} />
                <div style={{ margin: '12px auto 12px' }}>
                    Việc đặt lịch cần có số điện thoại để TTDK hỗ trợ tốt hơn cho quý khách. Vui lòng cung cấp số điện thoại
                </div>
                <div>
                    <Button
                        className=" w-40  me-2"
                        onClick={() => onClose()}
                        style={{ marginTop: 8 }}
                        size="large">
                        Huỷ
                    </Button>
                    <Button
                        type="primary"
                        className=" w-40   ms-2"
                        onClick={() => onConfirm()}
                        style={{ marginTop: 8 }}
                        size="large">
                        Xác nhận
                    </Button>
                </div>
            </Modal>
        </>
    )
}

export const GlobalProvider = ({ children }) => {
    let isZaloApp = process.env.REACT_APP_ZALO_AUTH_ENABLE
    const [globalState, setGlobalState] = useState({
        phoneNumber: "",
        userName: "",
        isZaloApp: isZaloApp,
        isAuthorize:false,
        setting:undefined
    });

    const [openModal, setOpenModal] = useState(false);
    const updateGlobalState = (newValue) => {
        setGlobalState(newValue);
    };

    const handleConfirm = async () => {
        setOpenModal(false)
        await handleGetUserPhone()
    }

    const handleZaloAuthorize = async () => {
        if (process.env.REACT_APP_ZALO_AUTH_ENABLE * 1 === 1) {
            try {
                let setting = await getSettingZalo()
                if(setting['scope.userPhonenumber'] && setting['scope.userInfo']){
                    setGlobalState({
                        ...globalState,
                        isAuthorize:true
                    })
                }else{
                    await getZaloAuthorize()
                    setGlobalState({
                        ...globalState,
                        isAuthorize:true
                    })
                }
            } catch (error) {
                setOpenModal(true)
                throw error
            }
        }
    }

    const handleGetUserPhone = async () => {
        if (process.env.REACT_APP_ZALO_AUTH_ENABLE * 1 === 1) {
            try {
                if (!globalState.phoneNumber) {
                    const phoneNumber = await getZaloUserPhone()
                    setGlobalState({
                        ...globalState,
                        phoneNumber
                    })
                    return phoneNumber
                }
            } catch (error) {
                setOpenModal(true)
                throw error
            }
        }

    }

    const handleGetUserName = async () => {
        if (process.env.REACT_APP_ZALO_AUTH_ENABLE * 1 === 1) {
            try {
                if (!globalState.userName) {
                    const userName = await getZaloUserName()
                    setGlobalState({
                        ...globalState,
                        userName
                    })
                    return userName
                }

            } catch (error) {
                throw error
            }
        }

    }

    return (
        <GlobalContext.Provider value={{ setGlobalState,globalState, updateGlobalState, handleGetUserPhone, handleGetUserName, handleZaloAuthorize }}>
            {children}
            <WarningNotify isModalOpen={openModal} onConfirm={handleConfirm} onClose={() => setOpenModal(false)} />
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => {
    return React.useContext(GlobalContext);
};
