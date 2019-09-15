import React, { useState, useEffect } from 'react';
import DataGrid, { Column, FilterRow, HeaderFilter, Export, Paging, Pager } from 'devextreme-react/data-grid';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.material.orange.dark.css';
import { db } from '../config/firebase';
import QRCode from './QRCode';
import XLSX from 'xlsx';
import { resolve, reject } from 'q';


const GuestsList = (props) => {
  const [guests, setGuests] = useState();
  const fileInput = React.createRef();
  useEffect(() => {
    db.collection('guests').onSnapshot(snapshot => {
        setGuests(snapshot.docs.map(doc => {
            return {
                qrCode: doc.id,
                ...doc.data()
            }
        }))
    })
  }, []);

  const formatTime = (cellData) => {
      if (cellData.date) {
        return new Date(cellData.date.seconds * 1000);
      }
      return;
  }

  const onToolbarPreparing = (e) => {
    e.toolbarOptions.items.unshift(
        {
            location: 'after',
            widget: 'dxButton',
            options: {
                icon: 'download',
                text: 'Import Guest List',
                onClick: importGuestList.bind(this)
            }
        }
    );
  }

  const importGuestList = (e) => {
    fileInput.current.click();
  }
  
  const onFileSelect = (e) => {
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => resolve(parseFile(reader.result));
    reader.onerror = error => reject(error);
  }

  const parseFile = (data) => {
    const base64 = data.split(',')[1];
    const xlsx  = XLSX.read(base64);
    importToFirestore(XLSX.utils.sheet_to_json(xlsx.Sheets.Sheet1));
    return true;
  }

  const importToFirestore = (guests) => {
    const dataToImport = [...guests.map((guest) => {
        return {
            name: `${guest['First Name']} ${guest['Last Name']}`,
            employer: guest['Employer'],
            type:guest['Attendee Type']
        }
    })];
    let batchTransaction = db.batch();
    dataToImport.forEach((record) => {
        const docRef = db.collection('guests').doc();
        batchTransaction.set(docRef, record);
    });
    batchTransaction.commit();
  }

  return guests ? (
    <div className='guestsContainer'>
    <input id="fileInput" ref={fileInput} onChange={onFileSelect} type="file" />
      <DataGrid
        dataSource={guests}
        showBorders={true}
        onToolbarPreparing={onToolbarPreparing}>
        <FilterRow visible={true} />
        <HeaderFilter visible={true} />
        <Paging defaultPageSize={10} />
        <Pager
          showPageSizeSelector={true}
          allowedPageSizes={[5, 10, 20]}
          showInfo={true} />
        <Export enabled={true} fileName={'Employees'} allowExportSelectedData={true} />
        <Column dataField='qrCode' caption='QR Code' cellRender={QRCode} />
        <Column dataField='name' caption='Name' />
        <Column dataField='employer' caption='Employer' />
        <Column dataField='type' caption='Attendee Type' />
        <Column dataField='date' caption='Date' dataType='datetime' calculateCellValue={formatTime} />
      </DataGrid>
    </div>
  ) : (<p>Loading...</p>)
};

export default GuestsList;
