import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';

const ImageUpload = () => {
    const [items, setItems] = useState([]);
    const [text, setText] = useState('');
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
            const newItem = { id, type: 'image', file, url: '', position: { x: 0, y: 0 } };

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

    const handleDrag = (id, e, ui) => {
        const { x, y } = ui;
        const xPercentage = (x / screenWidth) * 100;
        const yPercentage = (y / screenHeight) * 100;
        setItems(prevItems => prevItems.map(item => item.id === id ? { ...item, position: { x: xPercentage, y: yPercentage } } : item));
    };

    const handleSubmit = () => {
        console.log("Item positions relative to the screen size:");
        items.forEach(item => {
            console.log(`Item ID: ${item.id}, Type: ${item.type}, Position: X: ${item.position.x}%, Y: ${item.position.y}%`);
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
                    <Draggable key={item.id} onDrag={(e, ui) => handleDrag(item.id, e, ui)}>
                        {item.type === 'image' ? (
                            <img
                                src={item.url}
                                alt="Preview"
                                style={{ marginTop: '20px', maxWidth: '100%', cursor: 'move', position: 'absolute', left: `${item.position.x}%`, top: `${item.position.y}%` }}
                            />
                        ) : (
                            <div
                                style={{
                                    position: 'absolute',
                                    left: `${item.position.x}%`,
                                    top: `${item.position.y}%`,
                                    cursor: 'move',
                                    padding: '10px',
                                    background: 'lightgrey',
                                    borderRadius: '5px'
                                }}
                            >
                                {item.content}
                            </div>
                        )}
                    </Draggable>
                ))}
            </div>
        </div>
    );
};

export default ImageUpload;
