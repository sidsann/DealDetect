import React, {useState, useEffect} from 'react';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Divider from '@mui/joy/Divider';
import Table from '@mui/joy/Table';
import Sheet from '@mui/joy/Sheet';
import IconButton, { iconButtonClasses } from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import Dropdown from '@mui/joy/Dropdown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import DeleteIcon from '@mui/icons-material/Delete';


type JsonData = DataItem[];
type DataItem = {
    UID: string;
    Title: string;
    Price: number;
    Platform: string;
    URL: string | null;
    Rating: number | null;
    Sales: number | null;
    date_added: Date;
};

export default function FavoritesTable() {
    const [selected, setSelected] = React.useState<readonly string[]>([]);
    const [queryData, setQueryData] = React.useState<JsonData | null>(null);
    const [page, setPage] = useState(1);

    const getFavorites = async (newPage: number) => {
        const endpoint = 'http://localhost:8080/get_favorites';

        const queryParams = `?page=${newPage}`;
        const url = endpoint + queryParams;
        console.log(url);

        try {
            const response = await fetch(url);
            const jsonData = await response.json();
            setQueryData(jsonData);
            // Update the selected UIDs based on the new data
            const newSelectedUIDs = jsonData.map((item: { UID: string; }) => item.UID);
            setSelected(newSelectedUIDs);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const deleteFavorite = async (uid: string) => {
        const endpoint = `http://localhost:8080/delete_favorite?uid=${uid}`;
        try {
            const response = await fetch(endpoint, { method: 'DELETE' });
            return response.ok;  // Return true if deletion was successful
        } catch (error) {
            console.error('Error during delete:', error);
            return false;  // Return false if an error occurred
        }
    }


    useEffect(() => {
        getFavorites(page);
    }, [page]);

    const handleNextPage = async () => {
        await getFavorites(page + 1);
        setPage(page + 1);
    };

    const handlePreviousPage = async () => {
        await getFavorites(Math.max(page - 1, 1));
        setPage(Math.max(page - 1, 1));
    };

    return (
        <React.Fragment>
            <Sheet
                className="OrderTableContainer"
                variant="outlined"
                sx={{
                    display: { xs: 'none', sm: 'initial' },
                    width: '100%',
                    borderRadius: 'sm',
                    flexShrink: 1,
                    overflow: 'auto',
                    minHeight: 0,
                }}
            >
                <Table
                    aria-labelledby="tableTitle"
                    stickyHeader
                    hoverRow
                    sx={{
                        '--TableCell-headBackground': 'var(--joy-palette-background-level1)',
                        '--Table-headerUnderlineThickness': '1px',
                        '--TableRow-hoverBackground': 'var(--joy-palette-background-level1)',
                        '--TableCell-paddingY': '4px',
                        '--TableCell-paddingX': '8px',
                    }}
                >
                    <thead>
                        <tr>
                            <th style={{ width: 48, textAlign: 'center', padding: '12px 6px' }}>
                            </th>
                            <th style={{ width: 60, padding: '12px 6px' }}>Platform</th>
                            <th style={{ width: 140, padding: '12px 6px' }}>Name</th>
                            <th style={{ width: 90, padding: '12px 6px', textAlign: "center" }}>Price</th>
                            <th style={{ width: 90, padding: '12px 6px', textAlign: "center" }}>Sales Volume</th>
                            <th style={{ width: 75, padding: '12px 6px', textAlign: "center" }}>Rating</th>
                            <th style={{ width: 70, padding: '12px 6px' }}>Purchase Link</th>
                        </tr>
                    </thead>
                    <tbody>
                        {queryData && queryData.map((row) => (
                            <tr key={row.UID}>
                                <td style={{ textAlign: 'center', width: 120 }}>
                                    <IconButton
                                        variant="solid"
                                        color="danger"
                                        onClick={async () => {
                                            if (selected.includes(row.UID)) {
                                                console.log("removing from table");
                                                const deletionSuccessful = await deleteFavorite(row.UID);
                                                if (deletionSuccessful) {
                                                    console.log("successful deletion");
                                                    setQueryData(currentData =>
                                                        currentData ? currentData.filter(item => item.UID !== row.UID) : null
                                                    );
                                                    setSelected(ids => ids.filter(itemId => itemId !== row.UID));
                                                }
                                            }
                                        }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>


                                </td>
                                <td>
                                    <Typography level="body-lg">{row.Platform}</Typography>
                                </td>
                                <td>
                                    <Typography level="body-xs">{row.Title}</Typography>
                                </td>
                                <td>
                                    <Typography level="body-lg" style={{ textAlign: "center" }}>{row.Price}</Typography>

                                </td>
                                <td>
                                    <Typography level="body-lg" style={{ textAlign: "center" }}>{row.Sales}</Typography>

                                </td>
                                <td>
                                    <Typography level="body-lg" style={{ textAlign: "center" }}>{row.Rating}</Typography>

                                </td>
                                <td>
                                    {row.URL ? (
                                        <a href={row.URL} target="_blank" rel="noreferrer">
                                            <Button>
                                                Purchase
                                            </Button>
                                        </a>
                                    ) : (
                                        <Button
                                            disabled
                                            style={{
                                                opacity: 0.5,
                                                cursor: 'default'
                                            }}
                                        >
                                            Purchase
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Sheet>
            <Box
                className="Pagination-laptopUp"
                sx={{
                    pt: 2,
                    gap: 1,
                    [`& .${iconButtonClasses.root}`]: { borderRadius: '50%' },
                }}
                style={{ display: "flex", justifyContent: "space-between" }}
            >
                <Button
                    size="sm"
                    variant="outlined"
                    color="neutral"
                    startDecorator={<KeyboardArrowLeftIcon />}
                    onClick={handlePreviousPage}
                >
                    Previous
                </Button>


                <Button
                    size="sm"
                    variant="outlined"
                    color="neutral"
                    endDecorator={<KeyboardArrowRightIcon />}
                    onClick={handleNextPage}
                >
                    Next
                </Button>
            </Box>
        </React.Fragment>
    );
}