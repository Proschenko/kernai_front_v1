import { Collapse, Typography, Divider, Steps, Tag, Row, Col } from 'antd';
import { CheckOutlined, CameraOutlined, SearchOutlined, CommentOutlined } from '@ant-design/icons';

const { Panel } = Collapse;
const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const GuidePage = () => (
  <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
    <Title level={2}>Руководство пользователя</Title>
    
    <Collapse bordered={false} defaultActiveKey={['1']} accordion>
      {/* Раздел 1 - Загрузка данных */}
      <Panel 
        header={
          <span>
            <CameraOutlined style={{ marginRight: 8 }} />
            Загрузка новых данных
          </span>
        } 
        key="1"
        style={{ background: '#fafafa', marginBottom: 16 }}
      >
        <Steps direction="vertical" size="small" >
          <Step 
            title="Переход на вкладку" 
            description={
              <Text>
                Откройте вкладку <Tag color="blue">Главная</Tag> через боковое меню
              </Text>
            } 
          />
          <Step 
            title="Выбор типа загрузки" 
            description={
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>Варианты:</Text>
                  <ul>
                    <li><Tag>Изображение + Ведомость</Tag> - полный анализ и сопоставление</li>
                    <li><Tag>Изображение</Tag> - только изображение</li>
                  </ul>
                </Col>
              </Row>
            } 
          />
          <Step 
            title="Дополнительные параметры" 
            description={
              <>
                <Paragraph>
                  <Text strong>Лаборатория:</Text> Укажите источник данных из выпадающего списка
                </Paragraph>
                <Paragraph>
                  <Text strong>Ведомость:</Text> Вставьте данные из Excel (система автоматически посчитает записи)
                </Paragraph>
              </>
            } 
          />
          <Step 
            title="Загрузка изображения" 
            description={
              <>
                <Paragraph>
                  <Text strong>Требования к фото:</Text>
                </Paragraph>
                <ul>
                  <li>Только один контейнер в кадре</li>
                  <li>Хорошее освещение без бликов</li>
                  <li>Отсутствие посторонних предметов</li>
                  <li>Ровный угол съемки (90 градусов)</li>
                </ul>
              </>
            } 
          />
          <Step 
            title="Запуск анализа" 
            description={
              <Text>
                Нажмите кнопку <Tag color="blue">Анализировать</Tag> время обработки: до 2 минут
              </Text>
            } 
          />
        </Steps>
      </Panel>

      {/* Раздел 2 - Просмотр информации */}
      <Panel 
        header={
          <span>
            <SearchOutlined style={{ marginRight: 8 }} />
            Просмотр информации об образце
          </span>
        } 
        key="2"
        style={{ background: '#fafafa', marginBottom: 16 }}
      >
        <Steps direction="vertical" size="small">
          <Step 
            title="Переход в раздел" 
            description={
              <Text>
                Откройте вкладку <Tag color="blue">Учет образцов</Tag>
              </Text>
            } 
          />
          <Step 
            title="Поиск образца" 
            description={
              <>
                <Paragraph>
                  Используйте:
                </Paragraph>
                <ul>
                  <li>Поисковую строку (введите код или сотрудника)</li>
                  <li>Фильтры для точного поиска (в шапке таблицы)</li>
                </ul>
              </>
            } 
          />
          <Step 
            title="Просмотр деталей" 
            description={
              <>
                <Paragraph>
                  Кликните по строке с образцом для открытия карточки:
                </Paragraph>
                <ul>
                  <li>Основные параметры (местоположение, состояние)</li>
                  <li>История перемещений</li>
                  <li>Таблица комментариев</li>
                </ul>
              </>
            } 
          />
        </Steps>
      </Panel>

      {/* Раздел 3 - Комментарии */}
      <Panel 
        header={
          <span>
            <CommentOutlined style={{ marginRight: 8 }} />
            Добавление комментариев
          </span>
        } 
        key="3"
        style={{ background: '#fafafa', marginBottom: 16 }}
      >
        <Steps direction="vertical" size="small">
          <Step 
            title="Найдите образец" 
            description={
              <Text>
                Повторите шаги из раздела <Text strong>«Просмотр информации»</Text>
              </Text>
            } 
          />
          <Step 
            title="Откройте карточку" 
            description={
              <Text>
                Нажмите на строку с нужным образцом
              </Text>
            } 
          />
          <Step 
            title="Добавление комментария" 
            description={
              <>
                <Paragraph>
                  В разделе <Text strong>«Комментарии»</Text>:
                </Paragraph>
                <ol>
                  <li>Нажмите кнопку <Tag color="blue">Добавить комментарий</Tag></li>
                  <li>Введите текст в появившееся поле</li>
                  <li>Сохраните изменения</li>
                </ol>
              </>
            } 
          />
        </Steps>
      </Panel>
    </Collapse>

    <Divider />

    <Title level={4}>Дополнительная информация</Title>
    <Paragraph type="secondary">
      Для экстренных случаев обращайтесь в техническую поддержку: support@support.ru
    </Paragraph>
  </div>
);

export default GuidePage;