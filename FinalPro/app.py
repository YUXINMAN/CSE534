from flask import Flask, request, render_template, redirect, url_for, jsonify
import json
from bson import json_util
from bson.json_util import dumps
from numpy import *
import struct

app = Flask(__name__)
filenames = ['spdy_kity.pcap', 'http_kity.pcap', 'spdy_stopwatch.pcap', 'http_stopwatch.pcap', 'spdy_index.pcap', 'http_index.pcap', 'spdy_oneImage.pcap', 'http_oneImage.pcap','firefox_google.pcap','firefox_google_http.pcap']

@app.route("/")
def index():
    return render_template("index.html")
@app.route("/connht")
def CONN():
    return render_template("conn.html")

def createData(filename):
    fpcap1 = open(filename,'rb')
    dataset = fpcap1.read()
    return dataset

def parsepcapHeader(packet, i):
    packet_header = {}
    packet_header['GMTtime'] = packet[i:i+4]
    packet_header['GMTtime'] = struct.unpack('I', packet_header['GMTtime'])[0]
    packet_header['MicroTime'] = packet[i+4:i+8]
    packet_header['MicroTime'] = struct.unpack('I', packet_header['MicroTime'])[0]
    packet_header['caplen'] = packet[i+8:i+12]
    packet_header['caplen'] = struct.unpack('I', packet_header['caplen'])[0]
    packet_header['len'] = packet[i+12:i+16]
    packet_header['len'] = struct.unpack('I', packet_header['len'])[0]
    return packet_header

def parseTCPHeader(packet, i):
    TCP_header = {}
    TCP_header['srcip'] = packet[i+42:i+46]
    TCP_header['dstip'] = packet[i+46:i+50]
    TCP_header['srcport'] = packet[i+50:i+52]
    TCP_header['srcport'] = struct.unpack('>H', TCP_header['srcport'])[0]
    TCP_header['dstport'] = packet[i+52:i+54]
    TCP_header['dstport'] = struct.unpack('>H', TCP_header['dstport'])[0]
    TCP_header['Seq'] = packet[i+54:i+58]
    TCP_header['Seq'] = struct.unpack('>I', TCP_header['Seq'])[0]
    TCP_header['ACK'] = packet[i+58:i+62]
    TCP_header['ACK'] = struct.unpack('>I', TCP_header['ACK'])[0]
    TCP_header['Flags'] = packet[i+62:i+64]
    len_flags = struct.unpack('>H', TCP_header['Flags'])[0]
    a = int ('1111000000000000', 2)
    b = int('00010011', 2)
    TCP_len = int(bin(len_flags & a), 2)>>10
    flag = int(bin(len_flags & b),2)
    TCP_header['Flags'] = flag
    TCP_header['len'] = TCP_len

    return TCP_header

def getPacketList(string_data):
    list = []
    packet_num = 0
    i =24
    while(i<len(string_data)):
        packet = {}
        packet['phr'] = parsepcapHeader(string_data, i)
        packet['thr'] = parseTCPHeader(string_data, i)
        i = i+ 16 + packet['phr']['len']
        packet_num += 1
        list.append(packet)
    return (packet_num, list)

def PageLoadTime(packetList):
    ts_start = packetList[0]['phr']['GMTtime'] + packetList[0]['phr']['MicroTime']/1000000.0
    ts_finish = packetList[len(packetList)-1]['phr']['GMTtime'] + packetList[len(packetList)-1]['phr']['MicroTime']/1000000.0
    return ts_finish - ts_start

def ThroughPut(packetList):
    ts_start = packetList[0]['phr']['GMTtime'] + packetList[0]['phr']['MicroTime']/1000000.0
    ts_finish = packetList[len(packetList)-1]['phr']['GMTtime'] + packetList[len(packetList)-1]['phr']['MicroTime']/1000000.0
    ts_val = ts_finish - ts_start
    totallen = 0
    for packet in packetList:
        totallen += packet['phr']['caplen']
    throughput = totallen/ts_val
    return throughput

@app.route("/plt")
def PageLoadTimeGraph():
    j = 0
    PLT_list = []
    while(j < len(filenames)):
        filedata = createData(filenames[j])
        (pnum, data) = getPacketList(filedata)
        PLT = PageLoadTime(data)
        PLT_list.append(PLT)
        j += 2
    j = 1
    while(j < len(filenames)):
        filedata = createData(filenames[j])
        (pnum, data) = getPacketList(filedata)
        PLT = PageLoadTime(data)
        PLT_list.append(PLT)
        j += 2
    return json.dumps(PLT_list, default=json_util.default)

@app.route("/tput")
def ThroughPutGraph():
    j = 0
    TPut_list = []
    while(j < len(filenames)):
        filedata = createData(filenames[j])
        (pnum, data) = getPacketList(filedata)
        TPut = ThroughPut(data)
        TPut_list.append(TPut)
        # print filenames[j]
        j += 2
    j = 1
    while(j < len(filenames)):
        filedata = createData(filenames[j])
        (pnum, data) = getPacketList(filedata)
        TPut = ThroughPut(data)
        TPut_list.append(TPut)
        # print filenames[j]
        j += 2
    return json.dumps(TPut_list, default=json_util.default)

@app.route("/pnum")
def PacketNumberGraph():
    j = 0
    PNum_list = []
    while(j < len(filenames)):
        filedata = createData(filenames[j])
        (pnum, data) = getPacketList(filedata)
        PNum_list.append(pnum)
        j += 2
    j = 1
    while(j < len(filenames)):
        filedata = createData(filenames[j])
        (pnum, data) = getPacketList(filedata)
        PNum_list.append(pnum)
        j += 2
    return json.dumps(PNum_list, default=json_util.default)

@app.route("/ppro")
def PacketPropGraph():
    j = 0
    PPro_list = []
    while(j < len(filenames)):
        pdata = 0
        pconn = 0
        filedata = createData(filenames[j])
        # print filenames[j]
        (pnum, data) = getPacketList(filedata)
        for packet in data:
            # print packet
            if (packet['phr']['caplen'] > packet['thr']['len']+20+14+16):
                pdata += 1
            else:
                pconn += 1
        ppro = [pdata, pconn]
        PPro_list.append(ppro)
        j += 1
    return json.dumps(PPro_list, default=json_util.default)

@app.route("/conn")
def PacketGroupGraph():
    j = 0
    PGrp_list = []
    conns = []
    while(j < len(filenames)):
        ports = []
        conn = 0
        Pc_list = []
        filedata = createData(filenames[j])
        (pnum, data) = getPacketList(filedata)
        i = 0
        for packet in data:
            node = {}
            # print packet
            if (packet['thr']['Flags'] == 18):
                ports.append(packet['thr']['dstport'])
                conn += 1
            for portNum in ports:
                if (packet['thr']['dstport']==portNum or packet['thr']['srcport']==portNum):
                    node['id'] = i
                    node['port'] = portNum
                    Pc_list.append(node)
                    i += 1
        PGrp_list.append(Pc_list)
        conns.append(conn)
        # print conns
        j += 1
    # print conns
    # for pp in PGrp_list:
    #     print pp
    return json.dumps(PGrp_list, default=json_util.default)

PLT = PageLoadTimeGraph()
print PLT
TPut = ThroughPutGraph()
print TPut
PNum = PacketNumberGraph()
print PNum
PPro = PacketPropGraph()
print PPro
PGrp = PacketGroupGraph()

if __name__ == "__main__":
    app.run(host='0.0.0.0',port=5000,debug=True)