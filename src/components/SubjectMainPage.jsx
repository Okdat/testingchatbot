import Sidebar from "./Sidebar";
import TopBar from "./teacherTopbar";
import React, { useState } from 'react';
import './SubjectMainPage.css';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// Accessibility helper function (example)
function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

// CustomTabPanel component (example)
function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function SubjectMainPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [value, setValue] = useState(0); // State for selected tab

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className="SubjectPage">
      <TopBar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`SubjectPage-container ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <Tab label="Theory" {...a11yProps(0)} />
            <Tab label="Excecises" {...a11yProps(1)} />
            <Tab label="Tests" {...a11yProps(2)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          Item One Content
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          Item Two Content
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          Item Three Content
        </CustomTabPanel>
      </div>
    </div>
  );
}

export default SubjectMainPage;