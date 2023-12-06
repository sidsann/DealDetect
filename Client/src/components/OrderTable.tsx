import React, {useState, useEffect} from 'react';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Link from '@mui/joy/Link';
import Input from '@mui/joy/Input';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Table from '@mui/joy/Table';
import Sheet from '@mui/joy/Sheet';
import Checkbox from '@mui/joy/Checkbox';
import IconButton, {iconButtonClasses} from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import Dropdown from '@mui/joy/Dropdown';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key,
): (
    a: { [key in Key]: number | string },
    b: { [key in Key]: number | string },
) => number {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

function RowMenu() {
    return (
        <Dropdown>
            <MenuButton
                slots={{root: IconButton}}
                slotProps={{root: {variant: 'plain', color: 'neutral', size: 'sm'}}}
            >
                <MoreHorizRoundedIcon/>
            </MenuButton>
            <Menu size="sm" sx={{minWidth: 140}}>
                <MenuItem>Edit</MenuItem>
                <MenuItem>Rename</MenuItem>
                <MenuItem>Move</MenuItem>
                <Divider/>
                <MenuItem color="danger">Delete</MenuItem>
            </Menu>
        </Dropdown>
    );
}

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

export default function OrderTable() {
    const [order, setOrder] = React.useState<Order>('desc');
    const [selected, setSelected] = React.useState<readonly string[]>([]);
    const [open, setOpen] = React.useState(false);

    const [page, setPage] = useState(1);
    const [inputValue, setInputValue] = useState('');
    const [queryData, setQueryData] = React.useState<JsonData | null>(null);

    type SearchBarProps = {
        setQueryData: React.Dispatch<React.SetStateAction<JsonData | null>>;
        setInputValue: React.Dispatch<React.SetStateAction<string>>;
    };
    useEffect(() => {
        const fetchPageResults = async () => {
            try {
                await getPageResults(page);
            } catch (error) {
                console.error('Error fetching page results:', error);
            }
        };
        fetchPageResults();
        }, [page]);

    const getPageResults = async (nextPage:number) => {
        const endpoint = 'http://localhost:8080/search';

        const queryParams = `?q=${encodeURIComponent(inputValue) + `&page=${nextPage}`}`;
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

    const handleNextPage = () => {
        setPage(prevPage => prevPage + 1);
    };

    const handlePreviousPage = () => {
        setPage(prevPage => Math.max(prevPage - 1, 1));
    };

    function SearchBar({setQueryData, setInputValue}: SearchBarProps) {
        const [query, setQuery] = useState('');

        const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            setQuery(event.target.value)
            console.log(event.target.value)
        };

        const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault(); // Prevent default form submission behavior

            const endpoint = 'http://localhost:8080/search';

            const queryParams = `?q=${encodeURIComponent(query) + "&page=1"}`;
            const url = endpoint + queryParams;
            setInputValue(query);
            console.log(url);

            try {
                const response = await fetch(url);
                const jsonData = await response.json();
                setQueryData(jsonData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        return (
            <form onSubmit={handleSubmit}>
                <FormControl sx={{flex: 1}} size="sm">
                    <FormLabel>Search for order</FormLabel>
                    <Input size="sm" placeholder="Search" startDecorator={<SearchIcon/>} value={query}
                           onChange={handleInputChange}/>
                </FormControl>
            </form>
        );
    }


    const renderFilters = () => (
        <React.Fragment>
            <FormControl size="sm">
                <FormLabel>Sort</FormLabel>
                <Select
                    size="sm"
                    placeholder="Sort by"
                    slotProps={{button: {sx: {whiteSpace: 'nowrap'}}}}
                >
                    <Option value="paid">Paid</Option>
                    <Option value="pending">Pending</Option>
                    <Option value="refunded">Refunded</Option>
                    <Option value="cancelled">Cancelled</Option>
                </Select>
            </FormControl>
        </React.Fragment>
    );
    return (
        <React.Fragment>
            <Box
                sx={{
                    borderRadius: 'sm',
                    py: 2,
                    display: {xs: 'none', sm: 'flex'},
                    flexWrap: 'wrap',
                    gap: 1.5,
                    '& > *': {
                        minWidth: {xs: '120px', md: '160px'},
                    },
                }}
            >
                <SearchBar setQueryData={setQueryData}
                           setInputValue={setInputValue}
                ></SearchBar>
                {renderFilters()}
            </Box>
            <Sheet
                className="OrderTableContainer"
                variant="outlined"
                sx={{
                    display: {xs: 'none', sm: 'initial'},
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
                        <th style={{width: 48, textAlign: 'center', padding: '12px 6px'}}>
                        </th>
                        <th style={{width: 60, padding: '12px 6px'}}>Platform</th>
                        <th style={{width: 140, padding: '12px 6px'}}>Name</th>
                        <th style={{width: 90, padding: '12px 6px'}}>
                            <Link
                                underline="none"
                                color="primary"
                                component="button"
                                onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
                                fontWeight="lg"
                                endDecorator={<ArrowDropDownIcon/>}
                                sx={{
                                    '& svg': {
                                        transition: '0.2s',
                                        transform:
                                            order === 'desc' ? 'rotate(0deg)' : 'rotate(180deg)',
                                    },
                                }}
                            >
                                Price
                            </Link>
                        </th>
                        <th style={{width: 90, padding: '12px 6px'}}>
                            <Link
                                underline="none"
                                color="primary"
                                component="button"
                                onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
                                fontWeight="lg"
                                endDecorator={<ArrowDropDownIcon/>}
                                sx={{
                                    '& svg': {
                                        transition: '0.2s',
                                        transform:
                                            order === 'desc' ? 'rotate(0deg)' : 'rotate(180deg)',
                                    },
                                }}
                            >
                                Sales Volume
                            </Link>
                        </th>
                        <th style={{width: 75, padding: '12px 6px'}}>
                            <Link
                                underline="none"
                                color="primary"
                                component="button"
                                onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
                                fontWeight="lg"
                                endDecorator={<ArrowDropDownIcon/>}
                                sx={{
                                    '& svg': {
                                        transition: '0.2s',
                                        transform:
                                            order === 'desc' ? 'rotate(0deg)' : 'rotate(180deg)',
                                    },
                                }}
                            >
                                Rating
                            </Link>
                        </th>
                        <th style={{width: 70, padding: '12px 6px'}}>Purchase Link</th>
                    </tr>
                    </thead>
                    <tbody>
                    {queryData && queryData.map((row) => (
                        <tr key={row.UID}>
                            <td style={{textAlign: 'center', width: 120}}>
                                <Checkbox
                                    size="sm"
                                    checked={selected.includes(row.UID)}
                                    color={selected.includes(row.UID) ? 'primary' : undefined}
                                    onChange={(event) => {
                                        setSelected((ids) =>
                                            event.target.checked
                                                ? ids.concat(row.UID)
                                                : ids.filter((itemId) => itemId !== row.UID),
                                        );
                                    }}
                                    slotProps={{checkbox: {sx: {textAlign: 'left'}}}}
                                    sx={{verticalAlign: 'text-bottom'}}
                                />
                            </td>
                            <td>
                                <Typography level="body-xs">{row.Platform}</Typography>
                            </td>
                            <td>
                                <Typography level="body-xs">{row.Title}</Typography>
                            </td>
                            <td>
                                <Typography level="body-xs">{row.Price}</Typography>

                            </td>
                            <td>
                                <Typography level="body-xs">{row.Sales}</Typography>

                            </td>
                            <td>
                                <Typography level="body-xs">{row.Rating}</Typography>

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
                    [`& .${iconButtonClasses.root}`]: {borderRadius: '50%'},
                    display: {
                        xs: 'none',
                        md: 'flex',
                    },
                }}
            >
                <Button
                    size="sm"
                    variant="outlined"
                    color="neutral"
                    startDecorator={<KeyboardArrowLeftIcon/>}
                    onClick={handlePreviousPage}
                >
                    Previous
                </Button>

                <Box sx={{flex: 1}}/>
                {['1', '2', '3', '…', '8', '9', '10'].map((page) => (
                    <IconButton
                        key={page}
                        size="sm"
                        variant={Number(page) ? 'outlined' : 'plain'}
                        color="neutral"
                    >
                        {page}
                    </IconButton>
                ))}
                <Box sx={{flex: 1}}/>

                <Button
                    size="sm"
                    variant="outlined"
                    color="neutral"
                    endDecorator={<KeyboardArrowRightIcon/>}
                    onClick={handleNextPage}
                >
                    Next
                </Button>
            </Box>
        </React.Fragment>
    );
}
