import React from 'react';


const QRCode = (cellData) => {
    let url = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${cellData.value}`;
    return (
        <div className="qrContainer">
            <a href={url} rel="noopener noreferrer" target="_blank" downlaod="true">
                <img width='50' src={url} alt='qrCode' />
            </a>
        </div>
    )
}


export default QRCode