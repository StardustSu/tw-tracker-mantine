'use client';

import { ActionIcon, Button, Flex, Group, Modal, NumberInput, Select, Stack, Table, Text, Textarea, TextInput, Title, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconCheck, IconExclamationCircle, IconGraph, IconNotebook, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import moment from "moment";
import { useEffect, useState } from "react";
import { AreaChart, LineChart } from "@mantine/charts";
import { useDisclosure } from "@mantine/hooks";
import { DatePickerInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";

interface IUser {
    id: number;
    name: string;
    grade: 'L1' | 'L2' | 'trainee' | 'prime';
    admission_at: number;
    stats: IStats[];
    feedback_at: number;
    notes: string;
    credit: number; 
}

interface IStats {
    speed: number;
    quality: number;
    csi: number;
    recorded_at: number;
}

const FAKE_DATA: IUser[] = [
    {
        id: 1,
        name: 'Трубицын Данил',
        grade: 'trainee',
        admission_at: 1746738000000,
        stats: [
            {
                speed: 24,
                quality: 100,
                csi: 91,
                recorded_at: 1749416400000,
            },
            {
                speed: 12,
                quality: 53,
                csi: 81,
                recorded_at: 1746738000000,
            },
            {
                speed: 16,
                quality: 69,
                csi: 93,
                recorded_at: 1744146000000,
            },
        ],
        credit: 71,
        feedback_at: 1754686800000,
        notes: 'fuk u'
    },
    {
        id: 2,
        name: 'Шишкин Владимир',
        grade: 'prime',
        admission_at: 174673800000,
        stats: [
            {
                speed: 66,
                quality: 21,
                csi: 55,
                recorded_at: 1744146000000,
            }
        ],
        credit: 1234,
        feedback_at: 175468680000,
        notes: 'fuk u 2'
    },
    {
        id: 3,
        name: 'Высоцкий Семен',
        grade: 'L1',
        admission_at: 1746799990000,
        stats: [
            {
                speed: 12,
                quality: 100,
                csi: 100,
                recorded_at: 1744146000000,
            }
        ],
        credit: 56,
        feedback_at: 1746799990000,
        notes: 'kys'
    },
];

const DUMMY_USER: IUser = {
    id: 0,
    name: 'Иван Иванов',
    admission_at: Date.now(),
    credit: 10,
    feedback_at: Date.now() + 30 * 24 * 60 * 60 * 1000,
    grade: 'trainee',
    notes: 'Новый сотрудник',
    stats: []
}

const API_BASE = "https://twsup-api.kube.lampamc.ru/staff";

export default function UsersTable() {
    const [users, setUsers] = useState<IUser[]>([]);
    const [selection, setSelection] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(false);

    /* Values for add statistics modal */
    const [addStatOpened, { open: openAddStat, close: closeAddStat }] = useDisclosure(false);
    const [addStatValues, setAddStatValues] = useState<IStats>({
        speed: 8,
        csi: 100,
        quality: 100,
        recorded_at: Date.now()
    });

    /* Values for memos */
    const [memoOpened, { open: openMemo, close: closeMemo }] = useDisclosure(false);
    const [memo, setMemo] = useState("");

    /* Values for edit user */
    const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

    function openAddStatModal(user: IUser) {
        return () => {
            setSelection(user);
            openAddStat();
        }
    }

    useEffect(() => {
        refresh();
        const int = setInterval(refresh, 2_000);
        return clearInterval(int);
    }, []);

    function refresh() {
        fetch(API_BASE + '/all')
            .then(res => res.ok && res.json())
            .then(data => setUsers(data))
            .catch(err => notifications.show({
                title: 'Произошла ошибка',
                message: err,
                color: 'red'
            }));
    }

    function createStats() {
        setLoading(true);
        fetch(API_BASE + "/stats", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: selection!.id,
                stats: addStatValues
            })
        })
            .then(res => {
                if (res.ok) {
                    notifications.show({
                        message: 'Успех!',
                        color: 'green'
                    });
                    refresh();
                    setLoading(false);
                    closeAddStat();
                }
            })
            .catch(err => notifications.show({
                title: 'Произошла ошибка',
                message: err,
                color: 'red'
            }));
    }

    function saveMemo() {
        setLoading(true);
        if (selection) selection.notes = memo;
        fetch(API_BASE + "/memo", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(selection)
        })
            .then(res => {
                if (res.ok) {
                    notifications.show({
                        message: 'Успех!',
                        color: 'green'
                    });
                    refresh();
                    setLoading(false);
                    closeMemo();
                }
            })
            .catch(err => notifications.show({
                title: 'Произошла ошибка',
                message: err,
                color: 'red'
            }));
    }

    function updateUser() {
        setLoading(true);
        fetch(API_BASE + "/update", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(selection)
        })
            .then(res => {
                if (res.ok) {
                    notifications.show({
                        message: 'Успех!',
                        color: 'green'
                    });
                    refresh();
                    setLoading(false);
                    closeEdit();
                }
            })
            .catch(err => notifications.show({
                title: 'Произошла ошибка',
                message: err,
                color: 'red'
            }));
    }
    
    return (
        <>
            <Modal
                opened={addStatOpened}
                onClose={closeAddStat}
                title={`${selection?.name} - Записать показатели`}
            >
                <Stack>
                    <NumberInput
                        label="Скорость"
                        min={0}
                        value={addStatValues.speed}
                        onChange={e => setAddStatValues({
                            ...addStatValues,
                            speed: Number(e) || 0 
                        })}
                    />
                    <NumberInput
                        label="Качество"
                        min={0}
                        max={100}
                        value={addStatValues.quality}
                        onChange={e => setAddStatValues({
                            ...addStatValues,
                            quality: Number(e) || 0 
                        })}
                    />
                    <NumberInput
                        label="CSI"
                        min={0}
                        max={100}
                        value={addStatValues.csi}
                        onChange={e => setAddStatValues({
                            ...addStatValues,
                            csi: Number(e) || 0 
                        })}
                    />
                    <DatePickerInput
                        label="Дата для метрики"
                        placeholder="Число месяца не важно (наверное)"
                        value={moment(addStatValues.recorded_at).toDate()}
                        onChange={e => setAddStatValues({
                            ...addStatValues,
                            recorded_at: moment(e).unix() * 1000
                        })}
                    />
                    <Button
                        variant="gradient"
                        color="green"
                        onClick={createStats}
                        loading={loading}
                    >
                        <IconPlus stroke={1.5} style={{ marginRight: '4px' }} />
                        Записать
                    </Button>
                </Stack>
            </Modal>
            <Modal
                opened={memoOpened}
                onClose={closeMemo}
                title={`${selection?.name} - Заметки по ОС`}
            >
                <Stack>
                    <Textarea
                        label="Заметки"
                        autosize
                        minRows={6}
                        size='md'
                        value={memo}
                        onChange={e => setMemo(e.target.value)}
                    />
                    <Button
                        variant="gradient"
                        color="green"
                        onClick={saveMemo}
                        loading={loading}
                    >
                        <IconCheck stroke={1.5} style={{ marginRight: '4px' }} />
                        Сохранить
                    </Button>
                </Stack>
            </Modal>
            <Modal
                opened={editOpened}
                onClose={closeEdit}
                title={`${selection?.id} - ${selection?.name} - Редактировать`}
            >
                {selection && <Stack>
                    <TextInput
                        label="Имя"
                        value={selection.name}
                        onChange={e => setSelection({
                            ...selection,
                            name: e.target.value
                        })}
                    />
                    <Select
                        label='Грейд'
                        data={['trainee', 'L1', 'L2', 'prime']}
                        value={selection.grade}
                        onChange={e => setSelection({
                            ...selection,
                            grade: (e as any) || "trainee"
                        })}
                    />
                    <DatePickerInput
                        label="Дата приема"
                        value={moment(selection.admission_at).toDate()}
                        onChange={e => setSelection({
                            ...selection,
                            admission_at: moment(e).unix()*1000
                        })}
                    />
                    <DatePickerInput
                        label="Дата ОС"
                        value={moment(selection.feedback_at).toDate()}
                        onChange={e => setSelection({
                            ...selection,
                            feedback_at: moment(e).unix()*1000
                        })}
                    />
                    <NumberInput
                        label="Социальный рейтинг"
                        min={0}
                        value={selection.credit}
                        onChange={e => setSelection({
                            ...selection,
                            credit: Number(e) || 1
                        })}
                    />
                    <Button
                        variant="gradient"
                        color="green"
                        onClick={updateUser}
                        loading={loading}
                    >
                        <IconCheck stroke={1.5} style={{ marginRight: '4px' }} />
                        Сохранить
                    </Button>
                </Stack>}
            </Modal>
            <Flex direction="column" ta="center" align="center" justify="center" gap="1rem" px="lg">
                <Title ta="center" mt={50} fw={800}>
                    Список сотрудников
                </Title>
                <Table
                    ta="left"
                    horizontalSpacing="xs"
                    verticalSpacing="xs"
                    data={{
                        head: ['Имя', 'Грейд', 'Дата приема', 'Показатели', 'Дата ОС', 'Социальный рейтинг', 'Действия'],
                        body: users.map((user) => [
                            <Text>{user.name}</Text>,
                            <Text>{user.grade}</Text>,
                            <Text>{moment(user.admission_at).format("DD.MM.YYYY")}</Text>,
                            <Group>
                                <Stack gap={'0'}>
                                    <Text>Скорость: {user.stats?.[0]?.speed}</Text>
                                    <Text>Качество: {user.stats?.[0]?.quality}%</Text>
                                    <Text>CSI: {user.stats?.[0]?.csi}%</Text>
                                </Stack>
                                <Tooltip label="Добавить запись">
                                    <ActionIcon 
                                        variant="light"
                                        onClick={openAddStatModal(user)}
                                    >
                                        <IconPlus />
                                    </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Посмотреть динамику">
                                    <ActionIcon 
                                        variant="light"
                                        onClick={() => {
                                            const csidata = user.stats.reverse().map(x => {
                                                return {
                                                    'CSI': x.csi,
                                                    'Максимально': 100,
                                                    date: moment(x.recorded_at).format("MMMM YYYY")
                                                }
                                            });
                                            const speeddata = user.stats.reverse().map(x => {
                                                return {
                                                    'Скорость': x.speed,
                                                    'Минимальный порог': 6,
                                                    'Максимальный порог': 12,
                                                    date: moment(x.recorded_at).format("MMMM YYYY")
                                                }
                                            });
                                            const qualitydata = user.stats.reverse().map(x => {
                                                return {
                                                    'Качество': x.quality,
                                                    'Максимально': 100,
                                                    date: moment(x.recorded_at).format("MMMM YYYY")
                                                }
                                            });
                                            modals.open({
                                                title: `${user.name} - Показатели`,
                                                // w: 1200,
                                                fullScreen: true,
                                                children: <Stack mx={12}>
                                                    <Text>Скорость</Text>
                                                    <LineChart
                                                        h={300}
                                                        data={speeddata}
                                                        dataKey="date"
                                                        series={[
                                                            { name: 'Скорость', color: 'grape.6' },
                                                            { name: 'Минимальный порог', color: 'yellow.6' },
                                                            { name: 'Максимальный порог', color: 'green.6' },
                                                        ]}
                                                        curveType="bump"
                                                        gridAxis="y"
                                                        tooltipAnimationDuration={200}
                                                    />
                                                    <Text>Качество</Text>
                                                    <LineChart
                                                        h={300}
                                                        data={qualitydata}
                                                        dataKey="date"
                                                        series={[
                                                            { name: 'Качество', color: 'grape.6' },
                                                            { name: 'Максимально', color: 'green.6' },
                                                        ]}
                                                        curveType="bump"
                                                        gridAxis="y"
                                                        tooltipAnimationDuration={200}
                                                    />
                                                    <Text>CSI</Text>
                                                    <LineChart
                                                        h={300}
                                                        data={csidata}
                                                        dataKey="date"
                                                        series={[
                                                            { name: 'CSI', color: 'grape.6' },
                                                            { name: 'Максимально', color: 'green.6' },
                                                        ]}
                                                        curveType="bump"
                                                        gridAxis="y"
                                                        tooltipAnimationDuration={200}
                                                    />
                                                </Stack>
                                            });
                                        }}
                                    >
                                        <IconGraph />
                                    </ActionIcon>
                                </Tooltip>
                            </Group>,
                            <Group>
                                <Text>
                                    {Date.now() >= user.feedback_at && <IconExclamationCircle stroke={1.5} size={22} color="red" />}
                                    {moment(user.feedback_at).format("DD.MM.YYYY")}
                                </Text>
                                <Tooltip label="Заметки ОС">
                                    <ActionIcon
                                        onClick={() => {
                                            setSelection(user);
                                            setMemo(user.notes);
                                            openMemo();
                                        }}
                                    >
                                        <IconNotebook />
                                    </ActionIcon>
                                </Tooltip>
                            </Group>,
                            <Text>{user.credit}</Text>,
                            <Flex direction="row" align="center" justify="center" gap="xs">
                                <ActionIcon
                                    variant="outline"
                                    onClick={() => {
                                        setSelection(user);
                                        openEdit();
                                    }}
                                >
                                    <IconPencil stroke={1} />
                                </ActionIcon>
                                <ActionIcon
                                    variant="outline"
                                    color="red"
                                >
                                    <IconTrash stroke={1} />
                                </ActionIcon>
                            </Flex>,
                        ]),
                    }}
                />
                <Button
                    variant="outline"
                    onClick={() => {
                        setSelection(DUMMY_USER);
                        openEdit();
                    }}
                >
                <IconPlus stroke={1.5} style={{ marginRight: '4px' }} />
                    Добавить
                </Button>
            </Flex>
        </>
    );
}