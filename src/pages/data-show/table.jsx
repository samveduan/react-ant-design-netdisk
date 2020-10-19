import React from 'react'
import { Row, Col, Table, Pagination, notification, Space, Button, Spin } from 'antd'
import axios from 'axios'

export default class TableCom extends React.Component {
    state = {
        tableData: [],
        selectedRowKeys: [], // Check here to configure the default column
        total: 0, // for Pagination,
        tableLoading: true
    };

    getTableColumns = () => {
        return [
            {
                title: 'ID',
                dataIndex: 'id',
                width: 30,
            },
            {
                title: '标题',
                dataIndex: 'title',
                width: 500,
            },
            {
                title: '内容',
                dataIndex: 'content'
            },
        ]
    }

    componentWillMount() {
        this.TableColumns = this.getTableColumns();
    }

    handleDeleteArticle() {
        if (this.state.selectedRowKeys.length === 0) {
            notification['error']({
                message: '错误提示',
                description:
                    '请选择要删除的内容！',
            });
        } else {
            notification['success']({
                message: '正确提示',
                description:
                    `将要删除${JSON.stringify(this.state.selectedRowKeys)}`,
            });
        }
    }

    onSelectChange = selectedRowKeys => {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({ selectedRowKeys });
    };

    // 获取表格数据
    getData(pageNumber, pageSize) {
        this.setState({
            tableLoading: true
        })

        axios.get(`/article/all/?pageSize=${pageSize}&pageNumber=${pageNumber}&sortName=id&sortOrder=desc&_=1595230808893`).then((resp) => {
            console.log("all data:");
            console.log(resp);
            let ajaxData = [];
            for (let i = 0; i < resp.data.rows.length; i++) {
                ajaxData.push({
                    key: resp.data.rows[i].id,
                    id: resp.data.rows[i].id,
                    title: resp.data.rows[i].title,
                    content: resp.data.rows[i].content,
                });
            }

            this.setState({
                tableData: ajaxData,
                total: resp.data.total,
                tableLoading: false
            })

        }, (err) => {
            console.log(err);
        });
    }

    onChange = (pageNumber, pageSize) => {
        this.getData(pageNumber, pageSize);
    };

    componentDidMount() {
        this.getData(1, 5);
    }

    render() {
        const { selectedRowKeys } = this.state;

        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange
        };

        return (<>
            <Row style={{ paddingBottom: 15 }}>
                <Col span={24}><Space size="small"><Button type="primary" ghost>添加</Button><Button type="primary" ghost onClick={() => this.handleDeleteArticle()}>删除</Button></Space></Col>
            </Row>
            <Row>
                <Col span={24}>
                    <Spin spinning={this.state.tableLoading} tip="加载中..." size="large">
                        <Table columns={this.TableColumns} dataSource={this.state.tableData} rowSelection={rowSelection} pagination={false} bordered
                            onRow={record => {
                                return {
                                    onClick: event => { console.log(record) },
                                    onDoubleClick: event => { console.log(event) }
                                }
                            }}
                        >
                        </Table>
                    </Spin>
                    <div style={{ height: 15 }}></div>
                    <Pagination
                        pageSizeOptions={[5, 10, 20, 50, 100]}
                        defaultPageSize={5}
                        total={this.state.total}
                        showSizeChanger
                        showQuickJumper
                        showTotal={total => `共 ${total} 条`}
                        onChange={this.onChange}
                    />
                </Col>
            </Row>
        </>);
    }
}