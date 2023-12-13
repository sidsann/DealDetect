import React from "react"
import Login from "./components/LoginPage"
import ProductSearch from "./components/ProductSearchPage"
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';


export default function App() {
    return (<Router>
        <Routes>
            <Route path="/" element={<Login/>}/>
            <Route path="/search" element={<ProductSearch/>}/>
        </Routes>
    </Router>);
}