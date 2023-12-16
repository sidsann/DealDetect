import React, { useState} from 'react';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Slider from '@mui/joy/Slider';
import Input from '@mui/joy/Input';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Table from '@mui/joy/Table';
import Sheet from '@mui/joy/Sheet';
import IconButton, { iconButtonClasses } from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import MoreInformation from './MoreInformation';
import {FavoriteBorder} from "@mui/icons-material";
import Favorite from '@mui/icons-material/Favorite'; 



type JsonData = DataItem[];
type DataItem = {
    UID: string;
    Title: string;
    Price: number;
    Platform: string;
    URL: string | null;
    Rating: number | null;
    Sales: number | null;
};

export default function ProductTable() {
    const [selected, setSelected] = React.useState<readonly string[]>([]);

    const [inputValue, setInputValue] = useState('');
    const [queryData, setQueryData] = React.useState<JsonData | null>(null);
    const [rating, setRating] = useState([0, 5]);
    const [selectedSort, setSelectedSort] = useState('');
    const [selectedSortOrder, setSelectedSortOrder] = useState('');
    const [priceFilter, setPriceFilter] = useState('');
    const [salesFilter, setSalesFilter] = useState('');
    const [page, setPage] = useState(1);
    const [infoModalOpen, setInfoModalOpen] = useState(false);

    const handleSalesFilter = (event: any, value: any) => {
        setSalesFilter(value);
        console.log("Selected:" + value);
    };
    const handlePriceFilter = (event: any, value: any) => {
        setPriceFilter(value);
        console.log("Selected:" + value);
    };
    const handleSortChange = (event: any, value: any) => {
        setSelectedSort(value);
        console.log("Selected:" + value);
    };
    const handleSortOrderChange = (event: any, value: any) => {
        setSelectedSortOrder(value);
        console.log("Selected:" + value);
    };
    const handleRatingChange = (event: Event, newValue: number | number[]) => {
        setRating(newValue as number[]);
        console.log("Selected:" + rating);
    };


    const getPageResults = async (newPage: number) => {
        const endpoint = 'http://localhost:8080/search';

        const queryParams = `?q=${encodeURIComponent(inputValue) +
            `&page=${newPage}` +
            `${(rating[0] != 0 || rating[1] != 5) ? `&lRating=${rating[0]}&hRating=${rating[1]}` : ""}` +
            `${selectedSort && selectedSortOrder ? `&od=${selectedSortOrder == "Ascending" ? "0" : "1"}&ov=${selectedSort}` : ""}` +
            `${priceFilter ? `${priceFilter}` : ""}` +
            `${salesFilter ? `${salesFilter}` : ''}`}`;
        const url = endpoint + queryParams;
        console.log(url);

        try {
            const response = await fetch(url);
            const jsonData = await response.json();
            setQueryData(jsonData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    const addFavorite = async (uid:string) => {
        const endpoint = `http://localhost:8080/add_favorite?uid=${uid}`;

        try {
            const response = await fetch(endpoint, { method: 'POST' });
            if (response.ok) {
                console.log("Insert successful");
            } else {
                console.error("Insert failed", response.status);
            }
        } catch (error) {
            console.error('Error during insert:', error);
        }
    }

    const deleteFavorite = async (uid:string) => {
        const endpoint = `http://localhost:8080/delete_favorite?uid=${uid}`;

        try {
            const response = await fetch(endpoint, { method: 'DELETE' });
            if (response.ok) {
                console.log("Delete successful");
            } else {
                console.error("Delete failed", response.status);
            }
        } catch (error) {
            console.error('Error during delete:', error);
        }
    }

    const handleNextPage = async () => {
        await getPageResults(page + 1);
        setPage(page + 1);
    };

    const handlePreviousPage = async () => {
        await getPageResults(Math.max(page - 1, 1));
        setPage(Math.max(page - 1, 1));
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
        console.log(event.target.value);
    };
    const handleMoreInformation = () => {
        setInfoModalOpen(true);
    };


    return (
        <React.Fragment>
            <Box
                sx={{
                    borderRadius: 'sm',
                    py: 2,
                    display: { xs: 'none', sm: 'flex' },
                    flexWrap: 'wrap',
                    gap: 1.5,
                    '& > *': {
                        minWidth: { xs: '120px', md: '160px' },
                    },
                }}
            >

                <FormControl sx={{ flex: 1 }} size="sm">
                    <FormLabel>Search</FormLabel>
                    <Input size="sm" placeholder="Search" startDecorator={<SearchIcon />} value={inputValue}
                        onChange={handleInputChange} />
                </FormControl>
                <FormControl size="sm">
                    <FormLabel>Sort</FormLabel>
                    <Select
                        size="sm"
                        placeholder="Sort by"
                        slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
                        onChange={handleSortChange}
                    >
                        <Option value="">No Sort Variable</Option>
                        <Option value="1">Price</Option>
                        <Option value="5">Sales Volume</Option>
                        <Option value="4">Rating</Option>
                    </Select>
                </FormControl>
                <FormControl size="sm">
                    <FormLabel>Order</FormLabel>
                    <Select
                        size="sm"
                        placeholder="Sort Order"
                        slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
                        onChange={handleSortOrderChange}
                    >
                        <Option value="">No Sort Order</Option>
                        <Option value="Ascending">Ascending</Option>
                        <Option value="Descending">Descending</Option>
                    </Select>
                </FormControl>

                <FormControl size="sm">
                    <FormLabel>Price</FormLabel>
                    <Select
                        size="sm"
                        placeholder="Filter by Price"
                        slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
                        onChange={handlePriceFilter}
                    >
                        <Option value="">Any Price</Option>
                        <Option value="&hPrice=10">&lt;$10</Option>
                        <Option value="&lPrice=10&hPrice=50">$10 - $50</Option>
                        <Option value="&lPrice=50&hPrice=200">$50 - $200</Option>
                        <Option value="&lPrice=200">&gt;$200</Option>
                    </Select>
                </FormControl>
                <FormControl size="sm">
                    <FormLabel>Sales</FormLabel>
                    <Select
                        size="sm"
                        placeholder="Filter by Sales Volume"
                        slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
                        onChange={handleSalesFilter}
                    >
                        <Option value="">Any Sales</Option>
                        <Option value="&lSales=100">&ge;100 sold</Option>
                        <Option value="&lSales=500">&ge;500 sold</Option>
                        <Option value="&lSales=1000">&ge;1000 sold</Option>
                        <Option value="&lSales=5000">&ge;5000 sold</Option>
                    </Select>
                </FormControl>
                <Button style={{ width: "150px", height: "50px", marginTop: "25px" }} onClick={async () => { await getPageResults(1); setPage(1); }}>Submit Query</Button>
                <Button
                    style={{ width: "150px", height: "50px", marginTop: "25px" }}
                    onClick={handleMoreInformation}
                >
                    More Information
                </Button>
                <MoreInformation open={infoModalOpen} onClose={() => setInfoModalOpen(false)} />
                <div>

                    <FormControl size={"sm"}><FormLabel>Filter by Rating</FormLabel> </FormControl>
                    <Slider
                        value={rating}
                        onChange={handleRatingChange}
                        valueLabelDisplay="auto"
                        min={0}
                        max={5}
                        style={{ width: "60rem" }}

                    />
                </div>

            </Box>
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
                                        color="primary"
                                        onClick={() => {
                                            if (selected.includes(row.UID)) {
                                                console.log("removing from table");
                                                // Item is currently selected, so remove it (unselect)
                                                setSelected(ids => ids.filter(itemId => itemId !== row.UID));
                                                deleteFavorite(row.UID); // Call the delete function
                                            } else {
                                                console.log("adding to table");
                                                // Item is not currently selected, so add it (select)
                                                setSelected(ids => [...ids, row.UID]);
                                                addFavorite(row.UID); // Call the add function
                                            }
                                        }}
                                    >
                                        {selected.includes(row.UID) ? <Favorite /> : <FavoriteBorder />}
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
