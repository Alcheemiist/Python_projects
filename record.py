import pandas as pd
import os

def read_and_extract_data(file_path, column_name, idud):
    df = pd.read_csv(file_path)
    index = ""
    j = -1
    for i in df:
        if (i.__contains__(column_name)):
            index = i
            j+= 1
    # print("I => ", j)
    # print(df.loc[j])
    filtered_data = df.loc[j]
    return filtered_data

def read_and_extract_multidata(file_path, column_name, idud):
    df = pd.read_csv(file_path)
    index = ""
    for i in df:
        if (i.__contains__(column_name)):
            index = i
    # print("index -> " , index)
    filtered_data = df.loc[df[index] == int(idud)]
    return filtered_data

def main():
    # Parameters 
    directory_path = './match_csv/'
    idud = "58609"
    output_file_path = './record_single_['+ idud + '].xlsx'
    output_file_path2 = './record_multiple_['+ idud + '].xlsx'
    file_list = os.listdir(directory_path)
    extracted_data = []
    #------#
    # print("list : " , file_list)
    for file_name in file_list:
        file_path = os.path.join(directory_path, file_name)
        column_name = '_PIDM'
        data = read_and_extract_data(file_path, column_name, idud)
        extracted_data.append(data)
    merged_data = pd.concat(extracted_data, ignore_index=False)
    with pd.ExcelWriter(output_file_path) as writer:
        merged_data.to_excel(writer, index=True, sheet_name='FilteredData')
    #Parameters
    directory_path = './Multiple/'
    file_list = os.listdir(directory_path)
    writer = pd.ExcelWriter(output_file_path2, engine='openpyxl')
    #------#
    for file_name in file_list:
        file_path = os.path.join(directory_path, file_name)
        column_name = '_PIDM'
        data = read_and_extract_multidata(file_path, column_name, idud)
        data.to_excel(writer, sheet_name=f"Sheet_{file_name}", index=False)
    writer._save()
    writer.close()

if __name__ == "__main__":
    main()
