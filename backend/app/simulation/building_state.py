from typing import Dict, List
from ..models.device import Device, DeviceType, DeviceCriticality, DeviceStatus, Room, Floor


def initialize_smart_building() -> tuple[Dict[str, Device], List[Floor]]:
    """
    Initializes a realistic 4-Floor Smart Building containing 26 heterogeneous connected devices.
    Floors:
      Floor 1: Reception, Public Lobby, Main Access Control
      Floor 2: Corporate Open Office, Smart Workplace, IoT Gateway
      Floor 3: Core Enterprise Data Center & Server Farm
      Floor 4: Executive Suites & Physical Security Control Room / OT
    """
    devices: Dict[str, Device] = {}

    # ------------------ FLOOR 1: Lobby & Reception ------------------
    devices["Reception-PC-101"] = Device(
        id="Reception-PC-101",
        name="Front Desk Terminal",
        type=DeviceType.WORKSTATION,
        ip_address="10.1.10.12",
        floor=1,
        room="Lobby Reception",
        network_segment="VLAN-10-GUEST-PUB",
        criticality=DeviceCriticality.MEDIUM,
        status=DeviceStatus.NORMAL,
        connected_devices=["EdgeRouter-101", "CoreSwitch-101", "DoorAccess-101"],
        metadata={"os": "Windows 11 Enterprise", "mac": "00:1A:2B:3C:4D:11"}
    )
    devices["Laptop-102"] = Device(
        id="Laptop-102",
        name="Visitor Concierge Laptop",
        type=DeviceType.LAPTOP,
        ip_address="10.1.10.25",
        floor=1,
        room="Visitor Lounge",
        network_segment="VLAN-10-GUEST-PUB",
        criticality=DeviceCriticality.LOW,
        status=DeviceStatus.NORMAL,
        connected_devices=["EdgeRouter-101", "WiFi-AP-101"],
        metadata={"os": "Windows 11 Pro", "mac": "00:1A:2B:3C:4D:12"}
    )
    devices["Laptop-103"] = Device(
        id="Laptop-103",
        name="Security Desk Laptop",
        type=DeviceType.LAPTOP,
        ip_address="10.1.10.28",
        floor=1,
        room="Guard Post 1",
        network_segment="VLAN-10-GUEST-PUB",
        criticality=DeviceCriticality.MEDIUM,
        status=DeviceStatus.NORMAL,
        connected_devices=["EdgeRouter-101", "CCTV-101", "DoorAccess-101"],
        metadata={"os": "Ubuntu 22.04 LTS", "mac": "00:1A:2B:3C:4D:13"}
    )
    devices["EdgeRouter-101"] = Device(
        id="EdgeRouter-101",
        name="Floor 1 Edge Router",
        type=DeviceType.ROUTER,
        ip_address="10.1.1.1",
        floor=1,
        room="Telecom Closet 1",
        network_segment="VLAN-01-INFRA",
        criticality=DeviceCriticality.HIGH,
        status=DeviceStatus.NORMAL,
        connected_devices=["CoreSwitch-101", "Reception-PC-101", "Laptop-102", "Laptop-103", "WiFi-AP-101", "CoreSwitch-301"],
        metadata={"os": "Cisco IOS-XE", "mac": "00:1A:2B:3C:4D:10"}
    )
    devices["CoreSwitch-101"] = Device(
        id="CoreSwitch-101",
        name="Lobby Access Switch",
        type=DeviceType.SWITCH,
        ip_address="10.1.1.2",
        floor=1,
        room="Telecom Closet 1",
        network_segment="VLAN-01-INFRA",
        criticality=DeviceCriticality.HIGH,
        status=DeviceStatus.NORMAL,
        connected_devices=["EdgeRouter-101", "CCTV-101", "DoorAccess-101", "CoreSwitch-301"],
        metadata={"os": "Juniper Junos", "mac": "00:1A:2B:3C:4D:14"}
    )
    devices["CCTV-101"] = Device(
        id="CCTV-101",
        name="Main Entrance CCTV",
        type=DeviceType.CCTV,
        ip_address="10.1.40.10",
        floor=1,
        room="Main Entrance",
        network_segment="VLAN-40-SEC-OT",
        criticality=DeviceCriticality.MEDIUM,
        status=DeviceStatus.NORMAL,
        connected_devices=["CoreSwitch-101", "CCTV-Master-402"],
        metadata={"firmware": "v4.2.1-IPCam", "mac": "00:1A:2B:3C:4D:15"}
    )
    devices["DoorAccess-101"] = Device(
        id="DoorAccess-101",
        name="Turnstile Badge Reader",
        type=DeviceType.DOOR_CONTROLLER,
        ip_address="10.1.40.15",
        floor=1,
        room="Turnstile Gate",
        network_segment="VLAN-40-SEC-OT",
        criticality=DeviceCriticality.HIGH,
        status=DeviceStatus.NORMAL,
        connected_devices=["CoreSwitch-101", "SmartDoor-403"],
        metadata={"firmware": "HID-Aero-2.1", "mac": "00:1A:2B:3C:4D:16"}
    )
    devices["WiFi-AP-101"] = Device(
        id="WiFi-AP-101",
        name="Lobby Public AP",
        type=DeviceType.ACCESS_POINT,
        ip_address="10.1.10.2",
        floor=1,
        room="Lobby Reception",
        network_segment="VLAN-10-GUEST-PUB",
        criticality=DeviceCriticality.LOW,
        status=DeviceStatus.NORMAL,
        connected_devices=["EdgeRouter-101", "Laptop-102"],
        metadata={"ssid": "Building-Guest", "mac": "00:1A:2B:3C:4D:17"}
    )

    # ------------------ FLOOR 2: Corporate Workspaces & IoT ------------------
    devices["Workstation-201"] = Device(
        id="Workstation-201",
        name="Finance Analyst PC",
        type=DeviceType.WORKSTATION,
        ip_address="10.2.20.101",
        floor=2,
        room="Finance Department",
        network_segment="VLAN-20-CORP",
        criticality=DeviceCriticality.HIGH,
        status=DeviceStatus.NORMAL,
        connected_devices=["CoreSwitch-201", "AppServer-301", "FileServer-303", "Printer-201"],
        metadata={"os": "Windows 11 Enterprise", "mac": "00:2A:2B:3C:4D:21"}
    )
    devices["Workstation-202"] = Device(
        id="Workstation-202",
        name="Engineering Desktop",
        type=DeviceType.WORKSTATION,
        ip_address="10.2.20.102",
        floor=2,
        room="Engineering Bay",
        network_segment="VLAN-20-CORP",
        criticality=DeviceCriticality.MEDIUM,
        status=DeviceStatus.NORMAL,
        connected_devices=["CoreSwitch-201", "AppServer-301", "Database-302"],
        metadata={"os": "Ubuntu 22.04 LTS", "mac": "00:2A:2B:3C:4D:22"}
    )
    devices["Workstation-203"] = Device(
        id="Workstation-203",
        name="HR Operations Desktop",
        type=DeviceType.WORKSTATION,
        ip_address="10.2.20.103",
        floor=2,
        room="HR Office",
        network_segment="VLAN-20-CORP",
        criticality=DeviceCriticality.HIGH,
        status=DeviceStatus.NORMAL,
        connected_devices=["CoreSwitch-201", "FileServer-303", "Printer-201"],
        metadata={"os": "macOS Sonoma", "mac": "00:2A:2B:3C:4D:23"}
    )
    devices["CoreSwitch-201"] = Device(
        id="CoreSwitch-201",
        name="Floor 2 Distribution Switch",
        type=DeviceType.SWITCH,
        ip_address="10.2.1.2",
        floor=2,
        room="Telecom Closet 2",
        network_segment="VLAN-01-INFRA",
        criticality=DeviceCriticality.HIGH,
        status=DeviceStatus.NORMAL,
        connected_devices=["Workstation-201", "Workstation-202", "Workstation-203", "Printer-201", "IoTGateway-201", "WiFi-AP-201", "CoreSwitch-301"],
        metadata={"os": "Cisco Catalyst", "mac": "00:2A:2B:3C:4D:20"}
    )
    devices["Printer-201"] = Device(
        id="Printer-201",
        name="Floor 2 Multi-Function Printer",
        type=DeviceType.PRINTER,
        ip_address="10.2.20.50",
        floor=2,
        room="Open Office Print Station",
        network_segment="VLAN-20-CORP",
        criticality=DeviceCriticality.LOW,
        status=DeviceStatus.NORMAL,
        connected_devices=["CoreSwitch-201", "Workstation-201", "Workstation-203"],
        metadata={"firmware": "HP-FutureSmart-5", "mac": "00:2A:2B:3C:4D:24"}
    )
    devices["IoTGateway-201"] = Device(
        id="IoTGateway-201",
        name="Building IoT Sensor Hub",
        type=DeviceType.IOT_GATEWAY,
        ip_address="10.2.50.1",
        floor=2,
        room="Utility Closet 2",
        network_segment="VLAN-50-IOT",
        criticality=DeviceCriticality.MEDIUM,
        status=DeviceStatus.NORMAL,
        connected_devices=["CoreSwitch-201", "TempSensor-202", "BMS-Controller-404"],
        metadata={"protocol": "MQTT/Zigbee", "mac": "00:2A:2B:3C:4D:25"}
    )
    devices["TempSensor-202"] = Device(
        id="TempSensor-202",
        name="Floor 2 Climate Sensor",
        type=DeviceType.SENSOR,
        ip_address="10.2.50.15",
        floor=2,
        room="Engineering Bay",
        network_segment="VLAN-50-IOT",
        criticality=DeviceCriticality.LOW,
        status=DeviceStatus.NORMAL,
        connected_devices=["IoTGateway-201"],
        metadata={"telemetry": "temperature_celsius", "mac": "00:2A:2B:3C:4D:26"}
    )
    devices["WiFi-AP-201"] = Device(
        id="WiFi-AP-201",
        name="Office Corporate WiFi AP",
        type=DeviceType.ACCESS_POINT,
        ip_address="10.2.20.2",
        floor=2,
        room="Open Office Central",
        network_segment="VLAN-20-CORP",
        criticality=DeviceCriticality.MEDIUM,
        status=DeviceStatus.NORMAL,
        connected_devices=["CoreSwitch-201"],
        metadata={"ssid": "Enterprise-Secure", "mac": "00:2A:2B:3C:4D:27"}
    )

    # ------------------ FLOOR 3: Enterprise Data Center ------------------
    devices["CoreSwitch-301"] = Device(
        id="CoreSwitch-301",
        name="Datacenter Core Switch",
        type=DeviceType.SWITCH,
        ip_address="10.3.1.1",
        floor=3,
        room="Datacenter Main Hall",
        network_segment="VLAN-01-INFRA",
        criticality=DeviceCriticality.CRITICAL,
        status=DeviceStatus.NORMAL,
        connected_devices=["CoreSwitch-101", "CoreSwitch-201", "AppServer-301", "Database-302", "FileServer-303", "BackupVault-304", "CoreSwitch-401"],
        metadata={"os": "Arista EOS", "mac": "00:3A:2B:3C:4D:30"}
    )
    devices["AppServer-301"] = Device(
        id="AppServer-301",
        name="Core Application Server",
        type=DeviceType.SERVER,
        ip_address="10.3.30.10",
        floor=3,
        room="Server Rack A1",
        network_segment="VLAN-30-SERVERS",
        criticality=DeviceCriticality.CRITICAL,
        status=DeviceStatus.NORMAL,
        connected_devices=["CoreSwitch-301", "Database-302", "FileServer-303", "SOC-Terminal-401"],
        metadata={"os": "RHEL 9.3", "ports": [80, 443, 8080, 22], "mac": "00:3A:2B:3C:4D:31"}
    )
    devices["Database-302"] = Device(
        id="Database-302",
        name="Enterprise SQL Database",
        type=DeviceType.DATABASE,
        ip_address="10.3.30.20",
        floor=3,
        room="Server Rack A2",
        network_segment="VLAN-30-SERVERS",
        criticality=DeviceCriticality.CRITICAL,
        status=DeviceStatus.NORMAL,
        connected_devices=["CoreSwitch-301", "AppServer-301", "BackupVault-304"],
        metadata={"os": "PostgreSQL Cluster", "ports": [5432], "mac": "00:3A:2B:3C:4D:32"}
    )
    devices["FileServer-303"] = Device(
        id="FileServer-303",
        name="Secure Document Vault",
        type=DeviceType.FILE_SERVER,
        ip_address="10.3.30.30",
        floor=3,
        room="Server Rack B1",
        network_segment="VLAN-30-SERVERS",
        criticality=DeviceCriticality.HIGH,
        status=DeviceStatus.NORMAL,
        connected_devices=["CoreSwitch-301", "AppServer-301", "BackupVault-304"],
        metadata={"os": "ZFS Storage Server", "protocols": ["SMB", "NFS"], "mac": "00:3A:2B:3C:4D:33"}
    )
    devices["BackupVault-304"] = Device(
        id="BackupVault-304",
        name="Immutable Disaster Recovery Backup",
        type=DeviceType.SERVER,
        ip_address="10.3.30.40",
        floor=3,
        room="Vault Room 3",
        network_segment="VLAN-30-SERVERS",
        criticality=DeviceCriticality.CRITICAL,
        status=DeviceStatus.PROTECTED,
        connected_devices=["CoreSwitch-301", "Database-302", "FileServer-303"],
        metadata={"os": "Hardened Linux Backup", "encryption": "AES-256-GCM", "mac": "00:3A:2B:3C:4D:34"}
    )

    # ------------------ FLOOR 4: Security Operations & Physical OT ------------------
    devices["CoreSwitch-401"] = Device(
        id="CoreSwitch-401",
        name="Floor 4 Security Switch",
        type=DeviceType.SWITCH,
        ip_address="10.4.1.1",
        floor=4,
        room="SOC Server Room",
        network_segment="VLAN-01-INFRA",
        criticality=DeviceCriticality.HIGH,
        status=DeviceStatus.NORMAL,
        connected_devices=["CoreSwitch-301", "SOC-Terminal-401", "CCTV-Master-402", "SmartDoor-403", "BMS-Controller-404", "IndustrialHVAC-405"],
        metadata={"os": "Cisco Catalyst", "mac": "00:4A:2B:3C:4D:40"}
    )
    devices["SOC-Terminal-401"] = Device(
        id="SOC-Terminal-401",
        name="Lead SOC Analyst Console",
        type=DeviceType.WORKSTATION,
        ip_address="10.4.40.5",
        floor=4,
        room="Control Room SOC",
        network_segment="VLAN-40-SEC-OT",
        criticality=DeviceCriticality.CRITICAL,
        status=DeviceStatus.NORMAL,
        connected_devices=["CoreSwitch-401", "AppServer-301", "CCTV-Master-402"],
        metadata={"role": "Security Analyst Command", "mac": "00:4A:2B:3C:4D:41"}
    )
    devices["CCTV-Master-402"] = Device(
        id="CCTV-Master-402",
        name="Central Surveillance NVR",
        type=DeviceType.CCTV,
        ip_address="10.4.40.20",
        floor=4,
        room="Control Room SOC",
        network_segment="VLAN-40-SEC-OT",
        criticality=DeviceCriticality.HIGH,
        status=DeviceStatus.NORMAL,
        connected_devices=["CoreSwitch-401", "CCTV-101", "SOC-Terminal-401"],
        metadata={"streams": 32, "storage_tb": 64, "mac": "00:4A:2B:3C:4D:42"}
    )
    devices["SmartDoor-403"] = Device(
        id="SmartDoor-403",
        name="Executive Floor Smart Lock Controller",
        type=DeviceType.DOOR_CONTROLLER,
        ip_address="10.4.40.30",
        floor=4,
        room="Executive Suite Entry",
        network_segment="VLAN-40-SEC-OT",
        criticality=DeviceCriticality.CRITICAL,
        status=DeviceStatus.NORMAL,
        connected_devices=["CoreSwitch-401", "DoorAccess-101", "BMS-Controller-404"],
        metadata={"protocol": "OSDP-v2", "mac": "00:4A:2B:3C:4D:43"}
    )
    devices["BMS-Controller-404"] = Device(
        id="BMS-Controller-404",
        name="Building Management System (BMS)",
        type=DeviceType.BMS,
        ip_address="10.4.40.40",
        floor=4,
        room="Facilities OT Room",
        network_segment="VLAN-40-SEC-OT",
        criticality=DeviceCriticality.CRITICAL,
        status=DeviceStatus.NORMAL,
        connected_devices=["CoreSwitch-401", "IoTGateway-201", "IndustrialHVAC-405", "SmartDoor-403"],
        metadata={"protocol": "BACnet/IP", "mac": "00:4A:2B:3C:4D:44"}
    )
    devices["IndustrialHVAC-405"] = Device(
        id="IndustrialHVAC-405",
        name="Datacenter Precision Chiller PLC",
        type=DeviceType.SENSOR,
        ip_address="10.4.40.50",
        floor=4,
        room="Facilities Roof/Plant Room",
        network_segment="VLAN-40-SEC-OT",
        criticality=DeviceCriticality.CRITICAL,
        status=DeviceStatus.NORMAL,
        connected_devices=["CoreSwitch-401", "BMS-Controller-404"],
        metadata={"target_temp": "19.5C", "protocol": "Modbus/TCP", "mac": "00:4A:2B:3C:4D:45"}
    )

    # ------------------ DEFINE FLOORS & ROOMS ------------------
    floors = [
        Floor(
            floor_number=1,
            name="Floor 1: Main Lobby & Public Access",
            description="Reception, Visitor Lounge, Public WiFi, Turnstile Gate, and Telecom Closet",
            rooms=[
                Room(id="room-101", name="Lobby Reception", floor=1, coordinates={"x": 20, "y": 20, "width": 140, "height": 100}, device_ids=["Reception-PC-101", "WiFi-AP-101"]),
                Room(id="room-102", name="Visitor Lounge", floor=1, coordinates={"x": 180, "y": 20, "width": 120, "height": 100}, device_ids=["Laptop-102"]),
                Room(id="room-103", name="Guard Post & Turnstiles", floor=1, coordinates={"x": 20, "y": 140, "width": 140, "height": 90}, device_ids=["Laptop-103", "DoorAccess-101", "CCTV-101"]),
                Room(id="room-104", name="Telecom Closet 1", floor=1, coordinates={"x": 180, "y": 140, "width": 120, "height": 90}, device_ids=["EdgeRouter-101", "CoreSwitch-101"])
            ],
            device_ids=["Reception-PC-101", "Laptop-102", "Laptop-103", "EdgeRouter-101", "CoreSwitch-101", "CCTV-101", "DoorAccess-101", "WiFi-AP-101"]
        ),
        Floor(
            floor_number=2,
            name="Floor 2: Corporate Workspace & IoT Hub",
            description="Open Workspace, Finance & HR Desks, Engineering Lab, IoT Gateway",
            rooms=[
                Room(id="room-201", name="Finance Office", floor=2, coordinates={"x": 20, "y": 20, "width": 130, "height": 95}, device_ids=["Workstation-201"]),
                Room(id="room-202", name="Engineering Lab", floor=2, coordinates={"x": 170, "y": 20, "width": 130, "height": 95}, device_ids=["Workstation-202", "TempSensor-202"]),
                Room(id="room-203", name="HR & Print Center", floor=2, coordinates={"x": 20, "y": 135, "width": 130, "height": 95}, device_ids=["Workstation-203", "Printer-201"]),
                Room(id="room-204", name="Telecom & IoT Hub", floor=2, coordinates={"x": 170, "y": 135, "width": 130, "height": 95}, device_ids=["CoreSwitch-201", "IoTGateway-201", "WiFi-AP-201"])
            ],
            device_ids=["Workstation-201", "Workstation-202", "Workstation-203", "CoreSwitch-201", "Printer-201", "IoTGateway-201", "TempSensor-202", "WiFi-AP-201"]
        ),
        Floor(
            floor_number=3,
            name="Floor 3: Enterprise Datacenter",
            description="High-density Server Racks, App Clusters, SQL Database, and Immutable Backup Vault",
            rooms=[
                Room(id="room-301", name="App Server Cluster Rack A1", floor=3, coordinates={"x": 20, "y": 20, "width": 130, "height": 95}, device_ids=["AppServer-301"]),
                Room(id="room-302", name="Enterprise Database Rack A2", floor=3, coordinates={"x": 170, "y": 20, "width": 130, "height": 95}, device_ids=["Database-302"]),
                Room(id="room-303", name="Core Routing Center", floor=3, coordinates={"x": 20, "y": 135, "width": 130, "height": 95}, device_ids=["CoreSwitch-301", "FileServer-303"]),
                Room(id="room-304", name="Air-Gapped Backup Vault", floor=3, coordinates={"x": 170, "y": 135, "width": 130, "height": 95}, device_ids=["BackupVault-304"])
            ],
            device_ids=["CoreSwitch-301", "AppServer-301", "Database-302", "FileServer-303", "BackupVault-304"]
        ),
        Floor(
            floor_number=4,
            name="Floor 4: SOC & Physical Security / OT",
            description="24/7 Security Operations Center, CCTV Master Control, BMS & HVAC Plant",
            rooms=[
                Room(id="room-401", name="Lead SOC Control Room", floor=4, coordinates={"x": 20, "y": 20, "width": 140, "height": 100}, device_ids=["SOC-Terminal-401", "CCTV-Master-402"]),
                Room(id="room-402", name="Executive Access Air-Lock", floor=4, coordinates={"x": 180, "y": 20, "width": 120, "height": 100}, device_ids=["SmartDoor-403"]),
                Room(id="room-403", name="Facilities & BMS Control", floor=4, coordinates={"x": 20, "y": 140, "width": 140, "height": 90}, device_ids=["BMS-Controller-404", "CoreSwitch-401"]),
                Room(id="room-404", name="HVAC Datacenter Chiller Plant", floor=4, coordinates={"x": 180, "y": 140, "width": 120, "height": 90}, device_ids=["IndustrialHVAC-405"])
            ],
            device_ids=["CoreSwitch-401", "SOC-Terminal-401", "CCTV-Master-402", "SmartDoor-403", "BMS-Controller-404", "IndustrialHVAC-405"]
        )
    ]

    return devices, floors
