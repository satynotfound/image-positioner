import React, { useState, useEffect } from 'react';
import { Resizable } from 're-resizable'; // Import resizable component
import { MdRotateRight } from 'react-icons/md'; // Import rotation icon

const ImageUpload = () => {
    const [items, setItems] = useState([]);
    const [text, setText] = useState('');
    const [selectedItemId, setSelectedItemId] = useState(null); // State to store the ID of the selected item
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [screenHeight, setScreenHeight] = useState(window.innerHeight);

    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
            setScreenHeight(window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleImageChange = (event) => {
        const files = Array.from(event.target.files);
        const newItems = files.map(file => {
            const reader = new FileReader();
            const id = Date.now() + Math.random();
            const newItem = { id, type: 'image', file, url: '', position: { x: 0, y: 0 }, width: 0, height: 0, rotation: 0 };

            reader.onloadend = () => {
                setItems(prevItems => prevItems.map(item => item.id === id ? { ...item, url: reader.result } : item));
            };
            reader.readAsDataURL(file);

            return newItem;
        });

        setItems(prevItems => [...prevItems, ...newItems]);
    };

    const handleTextChange = (event) => {
        setText(event.target.value);
    };

    const addText = () => {
        setItems(prevItems => [
            ...prevItems,
            { id: Date.now() + Math.random(), type: 'text', content: text, position: { x: 0, y: 0 } }
        ]);
        setText('');
    };

    const handleDragStart = (e, id) => {
        e.dataTransfer.setData('id', id);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('id');
        const { clientX, clientY } = e;
        const xPercentage = (clientX / screenWidth) * 100;
        const yPercentage = (clientY / screenHeight) * 100;
        setItems(prevItems => prevItems.map(item => item.id === id ? { ...item, position: { x: xPercentage, y: yPercentage }, isDragging: false } : item));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleHover = (id) => {
        setItems(prevItems => prevItems.map(item => item.id === id ? { ...item, zoomed: true } : item));
    };

    const handleLeave = (id) => {
        setItems(prevItems => prevItems.map(item => item.id === id ? { ...item, zoomed: false } : item));
    };

    const handleDrag = (id, e) => {
        e.preventDefault();
        const { clientX, clientY } = e;
        const xPercentage = (clientX / screenWidth) * 100;
        const yPercentage = (clientY / screenHeight) * 100;
        setItems(prevItems => prevItems.map(item => item.id === id ? { ...item, position: { x: xPercentage, y: yPercentage }, isDragging: true } : item));
    };

    const handleResize = (id, direction, styleSize, clientSize, delta) => {
        setItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, width: `${styleSize.width}`, height: `${styleSize.height}` } : item
            )
        );
    };
    
    const handleRotate = (id) => {
        setItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, rotation: item.rotation + 90 } : item
            )
        );
    };

    const handleSelectItem = (id) => {
        setSelectedItemId(id); // Update the selected item ID
    };

    const handleSubmit = () => {
        console.log("Item dimensions, positions, and rotation:");
        items.forEach(item => {
            console.log(`Item ID: ${item.id}, Type: ${item.type}, Width: ${item.width}px, Height: ${item.height}px, Position: X: ${item.position.x}%, Y: ${item.position.y}%, Rotation: ${item.rotation}deg`);
        });
    };
    

    return (
        <div>
            <h1>Image and Text Upload</h1>
            <form onSubmit={(e) => e.preventDefault()}>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} />
                <input
                    type="text"
                    value={text}
                    onChange={handleTextChange}
                    placeholder="Enter text"
                />
                <button type="button" onClick={addText}>Add Text</button>
                <button type="button" onClick={handleSubmit} style={{
                    backgroundColor: 'blue',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    display: 'flex',
                    justifyContent: 'center',
                    marginLeft: '35%',
                    marginTop: '30%',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '16px'
                }}>Submit</button>
            </form>
            <div>
                {items.map(item => (
                    <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item.id)}
                        onDrag={e => handleDrag(item.id, e)}
                        onDragEnd={() => setItems(prevItems => prevItems.map(prevItem => ({ ...prevItem, isDragging: false })))}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onMouseEnter={() => handleHover(item.id)}
                        onMouseLeave={() => handleLeave(item.id)}
                        onClick={() => handleSelectItem(item.id)} // Add onClick to handle item selection
                        style={{
                            position: 'absolute',
                            left: `${item.position.x}%`,
                            top: `${item.position.y}%`,
                            cursor: 'move',
                            padding: '10px',
                            background: 'lightgrey',
                            borderRadius: '5px',
                            transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`, // Rotate item
                            border: item.isDragging ? '2px dashed blue' : (item.id === selectedItemId ? '2px solid red' : 'none'), // Highlight selected item
                            zIndex: item.id === selectedItemId ? 1 : 'auto' // Bring selected item to the top
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onMouseUp={(e) => e.stopPropagation()}
                    >
                        {item.type === 'image' ? (
                            <Resizable
                                defaultSize={{ width: 200, height: 200 }}
                                style={{ width: '100%', height: '100%' }}
                                onResize={(e, direction, styleSize, clientSize, delta) =>
                                    handleResize(item.id, direction, styleSize, clientSize, delta)
                                }
                            >
                                <img
                                    src={item.url}
                                    alt="Preview"
                                    style={{ width: '100%', height: '100%', cursor: 'move' }}
                                />
                            </Resizable>
                        ) : (
                            <div style={{ width: '100%', height: '100%', cursor: 'move', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.content}</div>
                        )}
                        <MdRotateRight
                            style={{ position: 'absolute', right: '5px', bottom: '5px', cursor: 'pointer' }}
                            size={20}
                            onClick={() => handleRotate(item.id)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImageUpload;
