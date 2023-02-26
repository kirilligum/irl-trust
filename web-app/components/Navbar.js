import Nav from 'react-bootstrap/Nav';

export default function Navbar() {
    return (
        <Nav variant="pills" defaultActiveKey="/home">

            <Nav.Item>
                <Nav.Link href="/">IRL TrustLend</Nav.Link>
            </Nav.Item>

            <Nav.Item>
                <Nav.Link href="/borrow">Borrow</Nav.Link>
            </Nav.Item>

            <Nav.Item>
                <Nav.Link href="/lend">Lend</Nav.Link>
            </Nav.Item>

            <Nav.Item>
                <Nav.Link href="/dashboard">Dashboard</Nav.Link>
            </Nav.Item>

            <Nav.Item>
                <Nav.Link href="/messages">Messages</Nav.Link>
            </Nav.Item>

            <Nav.Item>
                <Nav.Link href="/marketplace">Marketplace</Nav.Link>
            </Nav.Item>

        </Nav>
    );
}