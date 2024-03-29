import Layout from "@/components/Layout";
import axios from "axios";
import { useEffect, useState } from "react";
import { withSwal } from "react-sweetalert2";

function Categories({swal}) {
    const [editedCategory, setEditedCategory] = useState(null);
    const[name, setName] = useState('');
    const[categories, setCategories] = useState([]);
    const [parentCategory, setParentCategory] = useState('');
    const [properties, setProperties] = useState([]);
    useEffect(() => {
        fetchCategories();
    }, []);
    function fetchCategories() {
        axios.get('/api/categories').then(result => {
            setCategories(result.data);
        });
    };

    async function saveCategory(e) {
        e.preventDefault();
        const data = {
            name, 
            parentCategory, 
            properties: properties.map(p => ({
                name: p.name,
                values: p.values.split(','),
            })),
        };
        if(editedCategory) {
            data._id = editedCategory._id;
            await axios.put('/api/categories', data)
        } else {
            await axios.post('/api/categories', data);
        }
        setName('');
        setParentCategory('');
        setProperties([]);
        fetchCategories();
    }

    function editCategory(category) {
        setEditedCategory(category);
        setName(category.name);
        setParentCategory(category.parent?._id);
        setProperties(
        category.properties.map(({name, values}) => ({
            name, 
            values: values.join(','),
        }))
        );
    }

    function deleteCategory(category) {
        swal.fire({
            title: 'Are you sure?',
            text: `Do you want to delete ${category.name}?`,
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonText: 'Yes, delete!',
            confirmButtonColor: '#d55',
            reverseButtons: true,
        }).then(async result => {
            if(result.isConfirmed) {
                const {_id} = category;
                await axios.delete('/api/categories?_id='+_id);
                fetchCategories();
            }
        });
    }

    function addProperty () {
        setProperties(prev => {
            return [...prev, {name:'', values:''}];
        });
    }

    function handlePropertyNameChange(index, property, newName) {
        setProperties(prev => {
            const properties = [...prev];
            properties[index].name = newName;
            return properties;
        });
    }

    function handlePropertyValuesChange(index, property, newValues) {
        setProperties(prev => {
            const properties = [...prev];
            properties[index].values = newValues;
            return properties;
        });
    }

    function removeProperty(indexToRemove) {
        setProperties(prev => {
            return [...prev].filter((p, pIndex) => {
                return pIndex !== indexToRemove;
            });
        });
    }

    return (
        <Layout>
            <h1>Categories</h1>
            <label>
                {editedCategory 
                ? `Edit category ${editedCategory.name}`
                : 'Create new category name'}
            </label>
            <form onSubmit={saveCategory}>
                <div className="flex gap-1">
                    <input  
                    type="text" 
                    placeholder={'Category name'} 
                    onChange={e => setName(e.target.value)}
                    value={name}/>
                    <select 
                    onChange={e => setParentCategory(e.target.value)}
                    value={parentCategory}>
                        <option value=''>No parent category</option>
                        {categories.length > 0 && categories.map(category => (
                        <option key={category._id} value={category._id}>{category.name}</option>
                    ))}
                    </select>
                </div>
                <div className="mb-2">
                    <label className="block">Properties</label>
                    <button
                        onClick={addProperty}
                        type="button" 
                        className="btn-default text-sm items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clipRule="evenodd" />
                            </svg>
                        Add new property
                    </button>
                    {properties.length > 0 && properties.map((property, index) => (
                        <div key={property.name} className="flex gap-1 mb-2">
                            <input 
                                type="text" 
                                className="mb-0"
                                value={property.name} 
                                onChange={e => handlePropertyNameChange(index, property, e.target.value)}
                                placeholder="property name (example: color)"/>
                            <input 
                                type="text" 
                                className="mb-0"
                                value={property.values} 
                                onChange={e => handlePropertyValuesChange(index, property, e.target.value)}
                                placeholder="values, comma separated"/>
                            <button 
                                onClick={() => removeProperty(index)}
                                type="button"
                                className="btn-red">
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-1">
                    {editedCategory && (
                        <button 
                            type="button"
                            onClick={() => {
                                setEditedCategory(null);
                                setName('');
                                setParentCategory('');
                                setProperties([]);
                            }}
                            className="btn-default">Cancel</button>
                    )}
                        <button 
                            type="submit" 
                            className="btn-primary py-1">
                        Save
                        </button>
                </div>
            </form>
            {!editedCategory && (
                    <table className="basic mt-4">
                    <thead>
                        <tr>
                            <td>Category name</td>
                            <td>Parent category</td>
                            <td></td>
                        </tr>
                    </thead>
                    <tbody>
                    {categories.length > 0 && categories.map(category => (
                        <tr key={category._id}>
                            <td>{category.name}</td>
                            <td>{category?.parent?.name}</td>
                            <td>
                                <button 
                                onClick={() => editCategory(category)} 
                                className="btn-default mr-1"
                                >
                                    Edit
                                </button>
                                <button 
                                className="btn-red"
                                onClick={() => deleteCategory(category)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </Layout>
    );
}

export default withSwal(({swal}, ref) => (
    <Categories swal = {swal}/>
));