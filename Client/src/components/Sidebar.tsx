import * as React from 'react';
import GlobalStyles from '@mui/joy/GlobalStyles';
import Box from '@mui/joy/Box';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton, { listItemButtonClasses } from '@mui/joy/ListItemButton';
import ListItemContent from '@mui/joy/ListItemContent';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import FavoriteIcon from '@mui/icons-material/Favorite'; 


import ColorSchemeToggle from './ColorSchemeToggle';
import { closeSidebar } from '../utils';
import {useState} from "react";

interface SidebarProps {
    setCurrentView: (view: string) => void;
}
const Sidebar: React.FC<SidebarProps> = ({ setCurrentView }) => {
    const [selectedItem, setSelectedItem] = useState('ProductTable');

    const handleItemClick = (item:string) => {
        setSelectedItem(item);
        setCurrentView(item);
    };

    return (
    <Sheet
      className="Sidebar"
      sx={{
        position: { xs: 'fixed', md: 'sticky' },
        transform: {
          xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))',
          md: 'none',
        },
        transition: 'transform 0.4s, width 0.4s',
        zIndex: 10000,
        height: '100dvh',
        width: 'var(--Sidebar-width)',
        top: 0,
        p: 2,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        borderRight: '1px solid',
        borderColor: 'divider',
      }}
    >
      <GlobalStyles
        styles={(theme) => ({
          ':root': {
            '--Sidebar-width': '220px',
            [theme.breakpoints.up('lg')]: {
              '--Sidebar-width': '240px',
            },
          },
        })}
      />
      <Box
        className="Sidebar-overlay"
        sx={{
          position: 'fixed',
          zIndex: 9998,
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          opacity: 'var(--SideNavigation-slideIn)',
          backgroundColor: 'var(--joy-palette-background-backdrop)',
          transition: 'opacity 0.4s',
          transform: {
            xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1) + var(--SideNavigation-slideIn, 0) * var(--Sidebar-width, 0px)))',
            lg: 'translateX(-100%)',
          },
        }}
        onClick={() => closeSidebar()}
      />
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>

        <Typography level="title-lg">DealDetect</Typography>
        <ColorSchemeToggle sx={{ ml: 'auto' }} />
      </Box>
      <Box
        sx={{
          minHeight: 0,
          overflow: 'hidden auto',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          [`& .${listItemButtonClasses.root}`]: {
            gap: 1.5,
          },
        }}
      >
        <List
          size="sm"
          sx={{
            gap: 1,
            '--List-nestedInsetStart': '30px',
            '--ListItem-radius': (theme) => theme.vars.radius.sm,
          }}
        >

          <ListItem>
              <ListItemButton
                  selected={selectedItem === 'ProductTable'}
                  onClick={() => handleItemClick('ProductTable')}
              >
              <ShoppingCartRoundedIcon />
              <ListItemContent>
                <Typography level="title-sm">Product Search</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>
            <ListItem>
                <ListItemButton
                    selected={selectedItem === 'FavoritesTable'}
                    onClick={() => handleItemClick('FavoritesTable')}
                >
                    <FavoriteIcon />
                    <ListItemContent>
                        <Typography level="title-sm">Favorites</Typography>
                    </ListItemContent>
                </ListItemButton>
            </ListItem>
        </List>
      </Box>
    </Sheet>
  );
}

export default Sidebar;

